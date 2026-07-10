"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createPasswordHash, getConfiguredAdminUser, getCurrentAdmin, type AdminCredential, verifyAdminPassword } from "@/lib/admin-auth";
import {
  cmsStore,
  listCmsNews,
  listCmsProducts,
  listDownloadAssets,
  listManagedPages,
  listMediaFiles,
  listProductCategories,
  type CmsNews,
  type CmsProduct,
  type CmsProductCategory,
  type DownloadAsset,
  type ManagedPage,
  type MediaFile,
  type PublishStatus,
  type SiteSetting,
  logAudit,
} from "@/lib/admin-cms";
import { createId, deleteStoreItem, readStore, upsertStore, writeStore } from "@/lib/local-store";
import type { InquiryRecord } from "@/lib/admin-data";
import { markSitemapDirty } from "@/lib/sitemap-dirty";

const statusSchema = z.enum(["draft", "review", "published", "offline", "archived"]);

function text(formData: FormData, key: string, fallback = "") {
  return String(formData.get(key) || fallback).trim();
}

function checkbox(formData: FormData, key: string) {
  return formData.get(key) === "on";
}

function numberValue(formData: FormData, key: string, fallback = 0) {
  const value = Number(formData.get(key));
  return Number.isFinite(value) ? value : fallback;
}

function tags(value: string) {
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

async function actor() {
  return (await getCurrentAdmin())?.username || "system";
}

async function audit(action: string, target: string, result: "success" | "failed" = "success") {
  await logAudit({ actor: await actor(), action, target, result });
}

async function refreshSitemap(reason: string) {
  await markSitemapDirty(reason);
  revalidateTag("sitemap-data");
  revalidatePath("/sitemap.xml");
  revalidatePath("/sitemaps/[file]", "page");
}

const categorySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2),
  slug: z.string().min(2),
  parentId: z.string().optional().default(""),
  sortOrder: z.number(),
  enabled: z.boolean(),
  coverImage: z.string().optional().default(""),
  icon: z.string().optional().default("folder"),
  summary: z.string().optional().default(""),
  description: z.string().optional().default(""),
  seoTitle: z.string().optional().default(""),
  seoDescription: z.string().optional().default(""),
  seoKeywords: z.string().optional().default(""),
  canonicalUrl: z.string().optional().default(""),
  ogImage: z.string().optional().default(""),
  indexable: z.boolean(),
});

export async function saveCategory(formData: FormData) {
  const now = new Date().toISOString();
  const parsed = categorySchema.parse({
    id: text(formData, "id"),
    name: text(formData, "name"),
    slug: text(formData, "slug"),
    parentId: text(formData, "parentId"),
    sortOrder: numberValue(formData, "sortOrder"),
    enabled: checkbox(formData, "enabled"),
    coverImage: text(formData, "coverImage"),
    icon: text(formData, "icon", "folder"),
    summary: text(formData, "summary"),
    description: text(formData, "description"),
    seoTitle: text(formData, "seoTitle"),
    seoDescription: text(formData, "seoDescription"),
    seoKeywords: text(formData, "seoKeywords"),
    canonicalUrl: text(formData, "canonicalUrl"),
    ogImage: text(formData, "ogImage"),
    indexable: checkbox(formData, "indexable"),
  });
  const existing = (await listProductCategories()).find((item) => item.id === parsed.id);
  const item: CmsProductCategory = {
    ...parsed,
    id: parsed.id || createId("cat"),
    createdAt: existing?.createdAt || now,
    updatedAt: now,
  };
  await cmsStore.upsertCategory(item);
  await audit("save_category", item.id);
  revalidatePath("/admin/product-categories");
  await refreshSitemap("category_saved");
}

export async function deleteCategory(formData: FormData) {
  const id = text(formData, "id");
  const products = await listCmsProducts();
  if (products.some((item) => item.categoryId === id)) {
    await audit("delete_category_blocked", id, "failed");
    redirect("/admin/product-categories?error=category-in-use");
  }
  const category = (await listProductCategories()).find((item) => item.id === id);
  if (category) await cmsStore.upsertCategory({ ...category, enabled: false, indexable: false, updatedAt: new Date().toISOString() });
  await audit("delete_category", id);
  revalidatePath("/admin/product-categories");
  await refreshSitemap("category_archived");
}

export async function saveProduct(formData: FormData) {
  const now = new Date().toISOString();
  const id = text(formData, "id") || createId("prod");
  const existing = (await listCmsProducts()).find((item) => item.id === id);
  const categories = await listProductCategories();
  const categoryId = text(formData, "categoryId") || categories[0]?.id || "";
  const category = categories.find((item) => item.id === categoryId);
  const status = statusSchema.parse(text(formData, "status", "draft")) as PublishStatus;
  const item: CmsProduct = {
    id,
    createdAt: existing?.createdAt || now,
    updatedAt: now,
    title: text(formData, "title"),
    englishName: text(formData, "englishName") || text(formData, "title"),
    subtitle: text(formData, "subtitle"),
    model: text(formData, "model"),
    sku: text(formData, "sku"),
    slug: text(formData, "slug"),
    categoryId,
    categoryName: category?.name || "",
    tags: tags(text(formData, "tags")),
    brand: text(formData, "brand", "GRIMM PUMP"),
    status,
    featured: checkbox(formData, "featured"),
    hot: checkbox(formData, "hot"),
    isNew: checkbox(formData, "isNew"),
    sortOrder: numberValue(formData, "sortOrder"),
    owner: text(formData, "owner"),
    summary: text(formData, "summary"),
    description: text(formData, "description"),
    sellingPoints: text(formData, "sellingPoints"),
    applications: text(formData, "applications"),
    structure: text(formData, "structure"),
    selectionGuide: text(formData, "selectionGuide"),
    installation: text(formData, "installation"),
    afterSales: text(formData, "afterSales"),
    mainImage: text(formData, "mainImage"),
    gallery: tags(text(formData, "gallery")),
    parameters: text(formData, "parameters")
      .split("\n")
      .map((line, index) => {
        const [name, value = "", unit = ""] = line.split("|").map((item) => item.trim());
        return { group: "Technical Data", name, value, unit, sortOrder: index + 1 };
      })
      .filter((item) => item.name),
    seoTitle: text(formData, "seoTitle"),
    seoDescription: text(formData, "seoDescription"),
    seoKeywords: text(formData, "seoKeywords"),
    canonicalUrl: text(formData, "canonicalUrl"),
    ogImage: text(formData, "ogImage"),
    indexable: checkbox(formData, "indexable"),
  };
  z.object({ title: z.string().min(2), slug: z.string().min(2) }).parse(item);
  await cmsStore.upsertProduct(item);
  revalidateTag("cms-products");
  await audit("save_product", item.id);
  revalidatePath("/admin/products");
  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath(`/products/${item.slug}`);
  await refreshSitemap("product_saved");
  redirect(`/admin/products/${item.id}/edit?saved=1`);
}

export async function deleteProduct(formData: FormData) {
  const id = text(formData, "id");
  const existing = (await listCmsProducts()).find((item) => item.id === id);
  if (existing) await cmsStore.upsertProduct({ ...existing, status: "archived", indexable: false, updatedAt: new Date().toISOString() });
  revalidateTag("cms-products");
  await audit("delete_product", id);
  revalidatePath("/admin/products");
  revalidatePath("/");
  revalidatePath("/products");
  if (existing) revalidatePath(`/products/${existing.slug}`);
  await refreshSitemap("product_archived");
}

export async function saveNews(formData: FormData) {
  const now = new Date().toISOString();
  const id = text(formData, "id") || createId("news");
  const existing = (await listCmsNews()).find((item) => item.id === id);
  const item: CmsNews = {
    id,
    createdAt: existing?.createdAt || now,
    updatedAt: now,
    title: text(formData, "title"),
    subtitle: text(formData, "subtitle"),
    slug: text(formData, "slug"),
    category: text(formData, "category", "Industry News"),
    tags: tags(text(formData, "tags")),
    author: text(formData, "author", "GRIMM PUMP"),
    coverImage: text(formData, "coverImage"),
    excerpt: text(formData, "excerpt"),
    content: text(formData, "content"),
    status: statusSchema.parse(text(formData, "status", "draft")) as PublishStatus,
    featured: checkbox(formData, "featured"),
    pinned: checkbox(formData, "pinned"),
    source: text(formData, "source"),
    publishAt: text(formData, "publishAt") || now,
    seoTitle: text(formData, "seoTitle"),
    seoDescription: text(formData, "seoDescription"),
    indexable: checkbox(formData, "indexable"),
  };
  z.object({ title: z.string().min(2), slug: z.string().min(2) }).parse(item);
  await cmsStore.upsertNews(item);
  revalidateTag("cms-blog");
  await audit("save_news", item.id);
  revalidatePath("/admin/news");
  revalidatePath("/blog");
  revalidatePath(`/blog/${item.slug}`);
  await refreshSitemap("blog_saved");
  redirect(`/admin/news/${item.id}/edit?saved=1`);
}

export async function deleteNews(formData: FormData) {
  const id = text(formData, "id");
  const existing = (await listCmsNews()).find((item) => item.id === id);
  if (existing) await cmsStore.upsertNews({ ...existing, status: "archived", indexable: false, updatedAt: new Date().toISOString() });
  revalidateTag("cms-blog");
  await audit("delete_news", id);
  revalidatePath("/admin/news");
  revalidatePath("/blog");
  if (existing) revalidatePath(`/blog/${existing.slug}`);
  await refreshSitemap("blog_archived");
}

export async function saveMedia(formData: FormData) {
  const now = new Date().toISOString();
  const id = text(formData, "id") || createId("media");
  const existing = (await listMediaFiles()).find((item) => item.id === id);
  const item: MediaFile = {
    id,
    createdAt: existing?.createdAt || now,
    updatedAt: now,
    name: text(formData, "name"),
    type: z.enum(["image", "video", "pdf", "document", "archive", "cad", "other"]).parse(text(formData, "type", "image")),
    url: text(formData, "url"),
    folder: text(formData, "folder", "General"),
    alt: text(formData, "alt"),
    description: text(formData, "description"),
    sizeLabel: text(formData, "sizeLabel"),
    uploadedBy: await actor(),
    downloads: numberValue(formData, "downloads"),
    usedBy: text(formData, "usedBy"),
  };
  z.object({ name: z.string().min(2), url: z.string().min(2) }).parse(item);
  await cmsStore.upsertMedia(item);
  await audit("save_media", item.id);
  revalidatePath("/admin/media");
}

export async function deleteMedia(formData: FormData) {
  const id = text(formData, "id");
  await cmsStore.deleteMedia(id);
  await audit("delete_media", id);
  revalidatePath("/admin/media");
}

export async function saveDownloadAsset(formData: FormData) {
  const now = new Date().toISOString();
  const id = text(formData, "id") || createId("download");
  const existing = (await listDownloadAssets()).find((item) => item.id === id);
  const item: DownloadAsset = {
    id,
    createdAt: existing?.createdAt || now,
    updatedAt: now,
    title: text(formData, "title"),
    category: text(formData, "category"),
    relatedProduct: text(formData, "relatedProduct"),
    version: text(formData, "version", "v1.0"),
    language: text(formData, "language", "English"),
    fileUrl: text(formData, "fileUrl"),
    gated: checkbox(formData, "gated"),
    status: statusSchema.parse(text(formData, "status", "published")) as PublishStatus,
    downloads: numberValue(formData, "downloads"),
    seoTitle: text(formData, "seoTitle"),
  };
  await cmsStore.upsertDownload(item);
  await audit("save_download", item.id);
  revalidatePath("/admin/downloads");
}

export async function saveManagedPage(formData: FormData) {
  const now = new Date().toISOString();
  const id = text(formData, "id") || createId("page");
  const existing = (await listManagedPages()).find((item) => item.id === id);
  const item: ManagedPage = {
    id,
    createdAt: existing?.createdAt || now,
    updatedAt: now,
    title: text(formData, "title"),
    slug: text(formData, "slug"),
    module: text(formData, "module", "Controlled component page"),
    banner: text(formData, "banner"),
    content: text(formData, "content"),
    cta: text(formData, "cta", "/contact"),
    status: statusSchema.parse(text(formData, "status", "published")) as PublishStatus,
    seoTitle: text(formData, "seoTitle"),
    seoDescription: text(formData, "seoDescription"),
  };
  await cmsStore.upsertPage(item);
  await audit("save_page", item.id);
  revalidatePath("/admin/pages");
  revalidatePath(item.slug || "/");
  await refreshSitemap("page_saved");
}

export async function saveSettings(formData: FormData) {
  const now = new Date().toISOString();
  const item: SiteSetting = {
    id: "site_settings",
    createdAt: text(formData, "createdAt") || now,
    updatedAt: now,
    companyName: text(formData, "companyName"),
    website: text(formData, "website"),
    email: text(formData, "email"),
    whatsapp: text(formData, "whatsapp"),
    address: text(formData, "address"),
    defaultLanguage: text(formData, "defaultLanguage", "en"),
    timezone: text(formData, "timezone", "Asia/Shanghai"),
    ga4Id: text(formData, "ga4Id"),
    gtmId: text(formData, "gtmId"),
    metaPixelId: text(formData, "metaPixelId"),
    googleVerification: text(formData, "googleVerification"),
    bingVerification: text(formData, "bingVerification"),
    robotsPolicy: text(formData, "robotsPolicy", "index,follow"),
  };
  await cmsStore.upsertSettings(item);
  await audit("save_settings", "site_settings");
  revalidatePath("/admin/settings");
}

export async function updateLeadStatus(formData: FormData) {
  const id = text(formData, "id");
  const inquiries = await readStore<InquiryRecord[]>("inquiries.json", []);
  const next = inquiries.map((item) =>
    item.id === id
      ? {
          ...item,
          status: text(formData, "status", item.status || "new"),
          intent: text(formData, "intent", item.intent || "unrated") as InquiryRecord["intent"],
          owner: text(formData, "owner", item.owner || ""),
          notes: text(formData, "notes", item.notes || ""),
        }
      : item,
  );
  await writeStore("inquiries.json", next);
  await audit("update_lead", id);
  revalidatePath("/admin/leads");
}

export async function deleteLead(formData: FormData) {
  const id = text(formData, "id");
  await deleteStoreItem<InquiryRecord>("inquiries.json", id);
  await audit("delete_lead", id);
  revalidatePath("/admin/leads");
}

export async function changeAdminPassword(_: { error?: string; success?: string } | undefined, formData: FormData) {
  const admin = getConfiguredAdminUser();
  const oldPassword = formData.get("oldPassword");
  const newPassword = text(formData, "newPassword");
  if (newPassword.length < 10) {
    return { error: "新密码至少需要 10 位。" };
  }
  if (!(await verifyAdminPassword(admin.username, oldPassword))) {
    await audit("change_password_failed", admin.username, "failed");
    return { error: "旧密码不正确。" };
  }
  const now = new Date().toISOString();
  const credential: AdminCredential = {
    id: "admin_env_credential",
    createdAt: now,
    updatedAt: now,
    username: admin.username,
    passwordHash: createPasswordHash(newPassword),
  };
  await upsertStore<AdminCredential>("admin-credentials.json", credential);
  await audit("change_password", admin.username);
  return { success: "密码已更新。请使用新密码登录。" };
}
