import { company, downloads, posts, products } from "@/data/site";
import { createId, deleteStoreItem, readStore, upsertStore, writeStore } from "@/lib/local-store";
import { getConfiguredAdminUser, type AdminRole } from "@/lib/admin-auth";

export type PublishStatus = "draft" | "review" | "published" | "offline" | "archived";

export type CmsProductCategory = {
  id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  slug: string;
  parentId: string;
  sortOrder: number;
  enabled: boolean;
  coverImage: string;
  icon: string;
  summary: string;
  description: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  canonicalUrl: string;
  ogImage: string;
  indexable: boolean;
};

export type CmsProductParameter = {
  group: string;
  name: string;
  value: string;
  unit: string;
  sortOrder: number;
};

export type CmsProduct = {
  id: string;
  createdAt: string;
  updatedAt: string;
  title: string;
  englishName: string;
  subtitle: string;
  model: string;
  sku: string;
  slug: string;
  categoryId: string;
  categoryName: string;
  tags: string[];
  brand: string;
  status: PublishStatus;
  featured: boolean;
  hot: boolean;
  isNew: boolean;
  sortOrder: number;
  owner: string;
  summary: string;
  description: string;
  sellingPoints: string;
  applications: string;
  structure: string;
  selectionGuide: string;
  installation: string;
  afterSales: string;
  mainImage: string;
  gallery: string[];
  parameters: CmsProductParameter[];
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  canonicalUrl: string;
  ogImage: string;
  indexable: boolean;
};

export type CmsNews = {
  id: string;
  createdAt: string;
  updatedAt: string;
  title: string;
  subtitle: string;
  slug: string;
  category: string;
  tags: string[];
  author: string;
  coverImage: string;
  excerpt: string;
  content: string;
  status: PublishStatus;
  featured: boolean;
  pinned: boolean;
  source: string;
  publishAt: string;
  seoTitle: string;
  seoDescription: string;
  indexable: boolean;
};

export type MediaFile = {
  id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  type: "image" | "video" | "pdf" | "document" | "archive" | "cad" | "other";
  url: string;
  folder: string;
  alt: string;
  description: string;
  sizeLabel: string;
  uploadedBy: string;
  downloads: number;
  usedBy: string;
};

export type DownloadAsset = {
  id: string;
  createdAt: string;
  updatedAt: string;
  title: string;
  category: string;
  relatedProduct: string;
  version: string;
  language: string;
  fileUrl: string;
  gated: boolean;
  status: PublishStatus;
  downloads: number;
  seoTitle: string;
};

export type ManagedPage = {
  id: string;
  createdAt: string;
  updatedAt: string;
  title: string;
  slug: string;
  module: string;
  banner: string;
  content: string;
  cta: string;
  status: PublishStatus;
  seoTitle: string;
  seoDescription: string;
};

export type SiteSetting = {
  id: string;
  createdAt: string;
  updatedAt: string;
  companyName: string;
  website: string;
  email: string;
  whatsapp: string;
  address: string;
  defaultLanguage: string;
  timezone: string;
  ga4Id: string;
  gtmId: string;
  metaPixelId: string;
  googleVerification: string;
  bingVerification: string;
  robotsPolicy: string;
};

export type AdminUser = {
  id: string;
  createdAt: string;
  updatedAt: string;
  username: string;
  displayName: string;
  role: AdminRole;
  status: "active" | "disabled";
  lastLoginAt?: string;
};

export type AuditLog = {
  id: string;
  createdAt: string;
  actor: string;
  action: string;
  target: string;
  result: "success" | "failed";
  ip?: string;
  userAgent?: string;
  before?: string;
  after?: string;
};

const now = () => new Date().toISOString();

function splitSpec(spec: string): CmsProductParameter {
  const [name, ...value] = spec.split(":");
  return {
    group: "Technical Data",
    name: name?.trim() || "Specification",
    value: value.join(":").trim() || spec,
    unit: "",
    sortOrder: 0,
  };
}

const categorySeeds: CmsProductCategory[] = [
  ["Fire Pump Series", "fire-pump-series", "Complete fire pump packages, diesel fire pumps, electric fire pumps and jockey pump systems."],
  ["Water Supply Series", "water-supply-series", "Booster and water supply equipment for buildings and utility rooms."],
  ["Sewage Pump Series", "sewage-pump-series", "Submersible sewage pumps and integrated pump stations."],
  ["Mobile Pump Truck", "mobile-pump-truck", "Trailer-mounted mobile pump trucks for emergency and temporary water transfer."],
  ["Pumps", "pumps", "Core pump models for pressure boosting, fire protection and long-shaft applications."],
  ["Accessories", "accessories", "Controllers, valves, documents and supporting accessories."],
].map(([name, slug, summary], index) => ({
  id: `cat_${slug}`,
  createdAt: now(),
  updatedAt: now(),
  name,
  slug,
  parentId: "",
  sortOrder: index + 1,
  enabled: true,
  coverImage: "/assets/applications/hero-edj.webp",
  icon: "folder",
  summary,
  description: summary,
  seoTitle: `${name} | GRIMM PUMP`,
  seoDescription: summary,
  seoKeywords: name,
  canonicalUrl: `/products?category=${slug}`,
  ogImage: "/assets/applications/hero-edj.webp",
  indexable: true,
}));

function categoryFor(productCategory: string) {
  const lower = productCategory.toLowerCase();
  if (lower.includes("water")) return categorySeeds[1];
  if (lower.includes("sewage")) return categorySeeds[2];
  if (lower.includes("truck") || lower.includes("trailer")) return categorySeeds[3];
  if (lower.includes("pump") && !lower.includes("fire")) return categorySeeds[4];
  return categorySeeds[0];
}

const productSeeds: CmsProduct[] = products.map((product, index) => {
  const category = categoryFor(product.category);
  return {
    id: `prod_${product.slug}`,
    createdAt: now(),
    updatedAt: now(),
    title: product.title,
    englishName: product.title,
    subtitle: product.summary,
    model: product.title.split(" ")[0] || product.slug,
    sku: product.slug.toUpperCase().slice(0, 32),
    slug: product.slug,
    categoryId: category.id,
    categoryName: category.name,
    tags: [product.category, "export", "pump"],
    brand: company.shortName,
    status: "published",
    featured: index < 4,
    hot: index < 3,
    isNew: index < 2,
    sortOrder: index + 1,
    owner: "Product Manager",
    summary: product.summary,
    description: product.description,
    sellingPoints: product.specs.join("\n"),
    applications: "Fire protection, water supply and industrial project applications.",
    structure: "Pump, driver, controller, base frame, pipework and project documents where applicable.",
    selectionGuide: "Confirm flow, head, voltage, frequency, certification and project country before quotation.",
    installation: "Install according to project drawing, pump room layout and local fire protection requirements.",
    afterSales: "Technical documents, testing evidence and remote support are available for export projects.",
    mainImage: product.image,
    gallery: [product.image, ...(("detailImages" in product && Array.isArray(product.detailImages) ? product.detailImages : []) as { src: string }[]).map((item) => item.src)].slice(0, 8),
    parameters: product.specs.map(splitSpec),
    seoTitle: product.title,
    seoDescription: product.summary,
    seoKeywords: [product.title, product.category, "fire pump"].join(", "),
    canonicalUrl: `/products/${product.slug}`,
    ogImage: product.image,
    indexable: true,
  };
});

const newsSeeds: CmsNews[] = posts.map((post, index) => ({
  id: `news_${post.slug}`,
  createdAt: now(),
  updatedAt: now(),
  title: post.title,
  subtitle: post.text,
  slug: post.slug,
  category: post.category,
  tags: [post.category, "fire pump"],
  author: "GRIMM PUMP",
  coverImage: post.image,
  excerpt: post.text,
  content: post.content.join("\n\n"),
  status: "published",
  featured: index < 3,
  pinned: index === 0,
  source: post.sourceUrl,
  publishAt: post.date || now(),
  seoTitle: post.title,
  seoDescription: post.text,
  indexable: true,
}));

const downloadSeeds: DownloadAsset[] = downloads.map((item, index) => ({
  id: `down_${index + 1}`,
  createdAt: now(),
  updatedAt: now(),
  title: item.title,
  category: index === 0 ? "Catalog" : "Technical File",
  relatedProduct: "General",
  version: "v1.0",
  language: "English",
  fileUrl: item.file,
  gated: true,
  status: "published",
  downloads: 0,
  seoTitle: item.title,
}));

const pageSeeds: ManagedPage[] = [
  ["Home", "/", "Homepage"],
  ["About Us", "/about", "Company profile"],
  ["Products", "/products", "Product center"],
  ["Applications", "/applications", "Application pages"],
  ["Projects", "/projects", "Project cases"],
  ["Factory", "/factory", "Factory proof"],
  ["Contact Us", "/contact", "Inquiry page"],
].map(([title, slug, content], index) => ({
  id: `page_${index + 1}`,
  createdAt: now(),
  updatedAt: now(),
  title,
  slug,
  module: "Controlled component page",
  banner: "/assets/applications/hero-edj.webp",
  content,
  cta: "/contact",
  status: "published",
  seoTitle: `${title} | GRIMM PUMP`,
  seoDescription: content,
}));

export async function listProductCategories() {
  const items = await readStore<CmsProductCategory[]>("cms-product-categories.json", []);
  if (items.length) {
    const existing = new Set(items.map((item) => item.slug));
    return [...items, ...categorySeeds.filter((item) => !existing.has(item.slug))].sort((a, b) => a.sortOrder - b.sortOrder);
  }
  await writeStore("cms-product-categories.json", categorySeeds);
  return categorySeeds;
}

export async function listCmsProducts() {
  const items = await readStore<CmsProduct[]>("cms-products.json", []);
  if (items.length) {
    const existing = new Set(items.map((item) => item.slug));
    return [...items, ...productSeeds.filter((item) => !existing.has(item.slug))].sort((a, b) => a.sortOrder - b.sortOrder);
  }
  await writeStore("cms-products.json", productSeeds);
  return productSeeds;
}

export async function listCmsNews() {
  const items = await readStore<CmsNews[]>("cms-news.json", []);
  if (items.length) {
    const existing = new Set(items.map((item) => item.slug));
    return [...items, ...newsSeeds.filter((item) => !existing.has(item.slug))].sort(
      (a, b) => new Date(b.publishAt).getTime() - new Date(a.publishAt).getTime(),
    );
  }
  await writeStore("cms-news.json", newsSeeds);
  return newsSeeds;
}

export async function listMediaFiles() {
  return readStore<MediaFile[]>("cms-media.json", []);
}

export async function listDownloadAssets() {
  const items = await readStore<DownloadAsset[]>("cms-downloads.json", []);
  if (items.length) {
    const existing = new Set(items.map((item) => item.title));
    return [...items, ...downloadSeeds.filter((item) => !existing.has(item.title))];
  }
  await writeStore("cms-downloads.json", downloadSeeds);
  return downloadSeeds;
}

export async function listManagedPages() {
  const items = await readStore<ManagedPage[]>("cms-pages.json", []);
  if (items.length) {
    const existing = new Set(items.map((item) => item.slug));
    return [...items, ...pageSeeds.filter((item) => !existing.has(item.slug))];
  }
  await writeStore("cms-pages.json", pageSeeds);
  return pageSeeds;
}

export async function getSiteSettings() {
  const items = await readStore<SiteSetting[]>("cms-settings.json", []);
  if (items[0]) return items[0];
  const seed: SiteSetting = {
    id: "site_settings",
    createdAt: now(),
    updatedAt: now(),
    companyName: company.legalName,
    website: company.website,
    email: company.email,
    whatsapp: company.phone,
    address: company.address,
    defaultLanguage: "en",
    timezone: "Asia/Shanghai",
    ga4Id: process.env.NEXT_PUBLIC_GA_ID || "",
    gtmId: process.env.NEXT_PUBLIC_GTM_ID || "",
    metaPixelId: process.env.NEXT_PUBLIC_META_PIXEL_ID || "",
    googleVerification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "",
    bingVerification: process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION || "",
    robotsPolicy: "index,follow",
  };
  await writeStore("cms-settings.json", [seed]);
  return seed;
}

export async function listAdminUsers() {
  const configured = getConfiguredAdminUser();
  const items = await readStore<AdminUser[]>("admin-users.json", []);
  const seed: AdminUser = {
    id: "admin_env",
    createdAt: now(),
    updatedAt: now(),
    username: configured.username,
    displayName: configured.displayName,
    role: configured.role,
    status: "active",
  };
  if (!items.some((item) => item.username === seed.username)) {
    await writeStore("admin-users.json", [seed, ...items]);
    return [seed, ...items];
  }
  return items;
}

export async function listAuditLogs() {
  return readStore<AuditLog[]>("audit-logs.json", []);
}

export async function logAudit(entry: Omit<AuditLog, "id" | "createdAt">) {
  await upsertStore<AuditLog>("audit-logs.json", {
    id: createId("audit"),
    createdAt: now(),
    ...entry,
  });
}

export const cmsStore = {
  upsertCategory: (item: CmsProductCategory) => upsertStore("cms-product-categories.json", item),
  deleteCategory: (id: string) => deleteStoreItem<CmsProductCategory>("cms-product-categories.json", id),
  upsertProduct: (item: CmsProduct) => upsertStore("cms-products.json", item),
  deleteProduct: (id: string) => deleteStoreItem<CmsProduct>("cms-products.json", id),
  upsertNews: (item: CmsNews) => upsertStore("cms-news.json", item),
  deleteNews: (id: string) => deleteStoreItem<CmsNews>("cms-news.json", id),
  upsertMedia: (item: MediaFile) => upsertStore("cms-media.json", item),
  deleteMedia: (id: string) => deleteStoreItem<MediaFile>("cms-media.json", id),
  upsertDownload: (item: DownloadAsset) => upsertStore("cms-downloads.json", item),
  upsertPage: (item: ManagedPage) => upsertStore("cms-pages.json", item),
  upsertSettings: (item: SiteSetting) => upsertStore("cms-settings.json", item),
};
