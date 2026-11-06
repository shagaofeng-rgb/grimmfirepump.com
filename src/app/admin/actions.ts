"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createPasswordHash, getConfiguredAdminUser, getCurrentAdmin, type AdminCredential, verifyAdminPassword } from "@/lib/admin-auth";
import {
  cmsStore,
  getSiteSettings,
  listCmsNews,
  listCmsProducts,
  listDownloadAssets,
  listMediaFiles,
  listProductCategories,
  listCmsProductKnowledge,
  type CmsNews,
  type CmsProduct,
  type CmsProductCategory,
  type CmsProductKnowledge,
  type DownloadAsset,
  type MediaFile,
  type PublishStatus,
  type SiteSetting,
  logAudit,
} from "@/lib/admin-cms";
import { createId, deleteStoreItem, patchStoreItem, upsertStore } from "@/lib/local-store";
import type { InquiryRecord } from "@/lib/admin-data";
import { markSitemapDirty } from "@/lib/sitemap-dirty";
import { validTrafficExclusions } from "@/lib/traffic-context";
import type { EditorResult } from "@/components/admin/editor-form";

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

async function requireAdmin(allowedRoles: Array<"super_admin" | "content_manager" | "product_manager" | "sales" | "analyst">) {
  const admin = await getCurrentAdmin();
  if (!admin || !allowedRoles.includes(admin.role)) throw new Error("Unauthorized admin action.");
  return admin;
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
  slug: z.string().min(2).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens for category URLs."),
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

export async function saveCategory(_: EditorResult, formData: FormData): Promise<EditorResult> {
  await requireAdmin(["super_admin", "product_manager"]);
  const now = new Date().toISOString();
  const result = categorySchema.safeParse({
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
  if (!result.success) return { error: "请输入分类名称，并使用小写字母、数字和连字符作为路径标识。" };
  const parsed = result.data;
  const categories = await listProductCategories();
  const existing = categories.find((item) => item.id === parsed.id);
  if (categories.some((item) => item.id !== parsed.id && item.slug.toLowerCase() === parsed.slug.toLowerCase())) {
    return { error: "该分类路径标识已被使用，请输入其他标识。" };
  }
  if (parsed.parentId) {
    const parent = categories.find((item) => item.id === parsed.parentId);
    if (!parent || !parent.enabled || parent.parentId || parent.id === parsed.id) {
      return { error: "请选择已启用的一级分类作为上级。" };
    }
  }
  const item: CmsProductCategory = {
    ...parsed,
    id: parsed.id || createId("cat"),
    createdAt: existing?.createdAt || now,
    updatedAt: now,
  };
  await cmsStore.upsertCategory(item);
  await audit("save_category", item.id);
  revalidateTag("cms-product-categories");
  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath("/admin/product-categories");
  await refreshSitemap("category_saved");
  redirect("/admin/product-categories?saved=1");
}

export async function deleteCategory(formData: FormData) {
  await requireAdmin(["super_admin", "product_manager"]);
  const id = text(formData, "id");
  const products = await listCmsProducts();
  const categories = await listProductCategories();
  if (categories.some((item) => item.parentId === id && item.enabled)) {
    throw new Error("Disable child categories before archiving their parent.");
  }
  if (products.some((item) => item.categoryId === id)) {
    await audit("delete_category_blocked", id, "failed");
    redirect("/admin/product-categories?error=category-in-use");
  }
  const category = categories.find((item) => item.id === id);
  if (category) await cmsStore.upsertCategory({ ...category, enabled: false, indexable: false, updatedAt: new Date().toISOString() });
  await audit("delete_category", id);
  revalidateTag("cms-product-categories");
  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath("/admin/product-categories");
  await refreshSitemap("category_archived");
}

export async function saveProduct(_: EditorResult, formData: FormData): Promise<EditorResult> {
  await requireAdmin(["super_admin", "product_manager"]);
  const now = new Date().toISOString();
  const id = text(formData, "id") || createId("prod");
  const allProducts = await listCmsProducts();
  const existing = allProducts.find((item) => item.id === id);
  const categories = await listProductCategories();
  const categoryId = text(formData, "categoryId");
  const category = categories.find((item) => item.id === categoryId);
  if (!category || !category.enabled) return { error: "请选择已启用的产品分类。" };
  if (category.parentId && !categories.some((item) => item.id === category.parentId && item.enabled)) {
    return { error: "该分类的上级已停用，请更换分类。" };
  }
  const parsedStatus = statusSchema.safeParse(text(formData, "status", "draft"));
  if (!parsedStatus.success) return { error: "请选择有效的发布状态。" };
  const status = parsedStatus.data;
  const slug = text(formData, "slug");
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/i.test(slug) || slug.length > 160) return { error: "产品路径只能包含字母、数字和连字符。" };
  const canonicalPath = `/products/${slug.toLowerCase()}`;
  const item: CmsProduct = {
    id,
    createdAt: existing?.createdAt || now,
    updatedAt: now,
    title: text(formData, "title"),
    englishName: text(formData, "englishName") || text(formData, "title"),
    subtitle: text(formData, "subtitle"),
    model: text(formData, "model"),
    sku: text(formData, "sku"),
    slug,
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
    canonicalUrl: canonicalPath,
    ogImage: text(formData, "ogImage"),
    indexable: checkbox(formData, "indexable"),
  };
  if (item.title.length < 2 || item.title.length > 180) return { error: "产品名称须为 2 至 180 个字符。" };
  if (allProducts.some((product) => product.id !== id && product.slug.trim().toLowerCase() === item.slug.trim().toLowerCase())) {
    return { error: "该产品路径标识已被使用，请输入其他标识。" };
  }
  await cmsStore.upsertProduct(item);
  revalidateTag("cms-products");
  await audit("save_product", item.id);
  revalidatePath("/admin/products");
  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath(`/products/${item.slug}`);
  if (existing && existing.slug !== item.slug) revalidatePath(`/products/${existing.slug}`);
  await refreshSitemap("product_saved");
  redirect(`/admin/products/${item.id}/edit?saved=1`);
}

export async function deleteProduct(formData: FormData) {
  await requireAdmin(["super_admin", "product_manager"]);
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

export async function saveProductKnowledge(formData: FormData) {
  await requireAdmin(["super_admin", "product_manager"]);
  const existing = (await listCmsProductKnowledge()).find((item) => item.id === text(formData, "id"));
  if (!existing) redirect("/admin/product-knowledge?error=not-found");
  const now = new Date().toISOString();
  const commaList = (key: string) => tags(text(formData, key));
  const item: CmsProductKnowledge = {
    ...existing,
    updatedAt: now,
    enabled: checkbox(formData, "enabled"),
    primaryKeyword: text(formData, "primaryKeyword"),
    secondaryKeywords: commaList("secondaryKeywords"),
    specificationKeywords: commaList("specificationKeywords"),
    applicationKeywords: formData.has("applicationKeywords") ? commaList("applicationKeywords") : existing.applicationKeywords,
    industries: commaList("industries"),
    scenarios: commaList("scenarios"),
    buyerPainPoints: commaList("buyerPainPoints"),
    solutionSummary: text(formData, "solutionSummary"),
    buyerBenefits: commaList("buyerBenefits"),
    relatedProductSlugs: commaList("relatedProductSlugs"),
    relatedApplicationSlugs: commaList("relatedApplicationSlugs"),
    relatedKnowledgeSlugs: formData.has("relatedKnowledgeSlugs") ? commaList("relatedKnowledgeSlugs") : existing.relatedKnowledgeSlugs,
    prohibitedClaims: commaList("prohibitedClaims"),
  };
  await cmsStore.upsertProductKnowledge(item);
  revalidateTag("cms-product-knowledge");
  revalidatePath(`/products/${item.productSlug.toLowerCase()}`);
  await audit("save_product_knowledge", item.id);
  revalidatePath("/admin/product-knowledge");
  redirect("/admin/product-knowledge?saved=1");
}

export async function saveNews(_: EditorResult, formData: FormData): Promise<EditorResult> {
  await requireAdmin(["super_admin", "content_manager"]);
  const now = new Date().toISOString();
  const id = text(formData, "id") || createId("news");
  const allNews = await listCmsNews();
  const existing = allNews.find((item) => item.id === id);
  const requestedSlug = text(formData, "slug");
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(requestedSlug) || requestedSlug.length > 160) return { error: "文章路径只能包含小写字母、数字和连字符。" };
  const enteredDate = text(formData, "publishAt");
  const date = enteredDate ? new Date(`${enteredDate}Z`) : new Date(now);
  if (!Number.isFinite(date.getTime())) return { error: "请输入有效的发布时间。" };
  const publishAt = date.toISOString();
  if (allNews.some((item) => item.id !== id && item.slug === requestedSlug)) {
    return { error: "该文章路径标识已被使用，请输入其他标识。" };
  }
  const item: CmsNews = {
    id,
    createdAt: existing?.createdAt || now,
    updatedAt: now,
    title: text(formData, "title"),
    subtitle: text(formData, "subtitle"),
    slug: requestedSlug,
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
    publishAt,
    seoTitle: text(formData, "seoTitle"),
    seoDescription: text(formData, "seoDescription"),
    indexable: checkbox(formData, "indexable"),
  };
  if (item.title.length < 2 || item.title.length > 180) return { error: "文章标题须为 2 至 180 个字符。" };
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
  await requireAdmin(["super_admin", "content_manager"]);
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
  await requireAdmin(["super_admin", "content_manager", "product_manager"]);
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
  await requireAdmin(["super_admin", "content_manager", "product_manager"]);
  const id = text(formData, "id");
  await cmsStore.deleteMedia(id);
  await audit("delete_media", id);
  revalidatePath("/admin/media");
}

export async function saveDownloadAsset(formData: FormData) {
  await requireAdmin(["super_admin", "content_manager", "product_manager"]);
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

export async function saveSettings(formData: FormData) {
  await requireAdmin(["super_admin"]);
  const settings = await getSiteSettings();
  const timezone = text(formData, "timezone", "Asia/Shanghai");
  try { new Intl.DateTimeFormat("en", { timeZone: timezone }); } catch { redirect("/admin/settings?result=timezone"); }
  const analyticsExcludedIps = text(formData, "analyticsExcludedIps");
  if (analyticsExcludedIps.length > 4000 || !validTrafficExclusions(analyticsExcludedIps)) redirect("/admin/settings?result=ip");
  const item: SiteSetting = {
    ...settings,
    updatedAt: new Date().toISOString(),
    timezone,
    analyticsExcludedIps,
    analyticsExcludedUserAgents: text(formData, "analyticsExcludedUserAgents").slice(0, 4000),
  };
  await cmsStore.upsertSettings(item);
  await audit("save_settings", "site_settings");
  revalidateTag("traffic-settings");
  revalidatePath("/admin/settings");
  redirect("/admin/settings?result=saved");
}

export async function updateLeadStatus(formData: FormData) {
  await requireAdmin(["super_admin", "sales"]);
  const id = text(formData, "id");
  const status = z.enum(["new", "pending", "contacted", "quoted", "following", "sample", "negotiating", "won", "lost", "spam", "invalid"]).parse(text(formData, "status"));
  const intent = z.enum(["A", "B", "C", "unrated"]).parse(text(formData, "intent", "unrated"));
  const updated = await patchStoreItem<InquiryRecord>("inquiries.json", id, {
    status, intent, owner: text(formData, "owner").slice(0, 120), notes: text(formData, "notes").slice(0, 12000),
  });
  if (!updated) return;
  await audit("update_lead", id);
  revalidatePath("/admin/leads");
  revalidatePath(`/admin/leads/${id}`);
}

export async function deleteLead(formData: FormData) {
  await requireAdmin(["super_admin", "sales"]);
  const id = text(formData, "id");
  await deleteStoreItem<InquiryRecord>("inquiries.json", id);
  await audit("delete_lead", id);
  revalidatePath("/admin/leads");
}

export async function changeAdminPassword(_: { error?: string; success?: string } | undefined, formData: FormData) {
  await requireAdmin(["super_admin"]);
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
