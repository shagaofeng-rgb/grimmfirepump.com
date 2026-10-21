import { isLegacyImportedBlogSlug, listCmsNews, listCmsProducts, listProductCategories, type CmsNews, type CmsProduct, type CmsProductCategory } from "@/lib/admin-cms";
import { unstable_cache } from "next/cache";
import { getProductDisplayName, getProductFamily } from "@/lib/product-taxonomy";
import { buildProductNavigation, publicCategorySlug, publicProductCategory } from "@/lib/product-navigation";

const cachedCmsProducts = unstable_cache(listCmsProducts, ["public-cms-products-v2"], { revalidate: 300, tags: ["cms-products"] });
const cachedProductCategories = unstable_cache(listProductCategories, ["public-cms-product-categories-v1"], { revalidate: 300, tags: ["cms-product-categories"] });
const cachedCmsNews = unstable_cache(listCmsNews, ["public-cms-blog-v3"], { revalidate: 300, tags: ["cms-blog"] });

export type PublicProduct = {
  slug: string;
  updatedAt: string;
  canonicalUrl: string;
  indexable: boolean;
  sourceUrl: string;
  title: string;
  category: string;
  groupSlug: string;
  releaseTime: string;
  image: string;
  summary: string;
  description: string;
  specs: string[];
  keywords: string;
  detailLines: string[];
  detailImages: Array<{ src: string; alt: string }>;
  structureItems: string[];
  applicationItems: string[];
  technicalParameters: string[];
};

export type PublicPost = {
  slug: string;
  updatedAt: string;
  canonicalUrl: string;
  indexable: boolean;
  sourceUrl: string;
  category: string;
  title: string;
  date: string;
  image: string;
  text: string;
  keywords: string;
  content: string[];
};

function lines(value: string) {
  return value.split(/\n+/).map((item) => item.trim()).filter(Boolean);
}

function publicArticleImage(value: string) {
  const fallback = "/assets/applications/hero-edj.webp";
  if (!value) return fallback;
  if (value.startsWith("/") && !value.startsWith("//")) return value;
  try {
    const url = new URL(value);
    const trustedHost = url.hostname.endsWith(".public.blob.vercel-storage.com")
      || url.hostname === "laikegeo.oss-cn-shanghai.aliyuncs.com";
    return url.protocol === "https:" && trustedHost ? url.toString() : fallback;
  } catch {
    return fallback;
  }
}

function productSpecs(item: CmsProduct) {
  const params = item.parameters.map((param) => [param.name, param.value, param.unit].filter(Boolean).join(": "));
  return (params.length ? params : lines(item.sellingPoints)).slice(0, 12);
}

function productDetailLines(item: CmsProduct) {
  return [
    item.description,
    item.sellingPoints,
    item.applications,
    item.structure,
    item.selectionGuide,
    item.installation,
    item.afterSales,
  ].flatMap(lines);
}

function mapProduct(item: CmsProduct, categories: Map<string, CmsProductCategory>): PublicProduct {
  // The CMS historically contains mixed-case slugs. Public URLs are normalized
  // to lowercase so links, canonical tags and Sitemaps describe one URL only.
  const slug = item.slug.trim().toLowerCase();
  const family = getProductFamily(item.slug, item.title, item.categoryName);
  const category = publicProductCategory(item.categoryId, categories);
  const publicCategory = category && [...categories.values()].find((entry) => entry.slug === publicCategorySlug(category.slug));
  const image = item.mainImage || "/assets/products/edj-package.webp";
  const gallery = item.gallery.length ? item.gallery : [image];
  return {
    slug,
    updatedAt: item.updatedAt || item.createdAt,
    canonicalUrl: `/products/${slug}`,
    indexable: item.indexable,
    sourceUrl: "",
    title: getProductDisplayName(item.slug, item.title),
    category: publicCategory?.name || category?.name || family.name,
    groupSlug: category ? publicCategorySlug(category.slug) : family.id,
    releaseTime: item.createdAt.slice(0, 10),
    image,
    summary: item.summary || item.description,
    description: item.description || item.summary,
    specs: productSpecs(item),
    keywords: item.seoKeywords || item.title,
    detailLines: productDetailLines(item),
    detailImages: gallery.map((src) => ({ src, alt: item.title })),
    structureItems: lines(item.structure),
    applicationItems: lines(item.applications),
    technicalParameters: item.parameters.map((param) => `${param.name}: ${[param.value, param.unit].filter(Boolean).join(" ")}`),
  };
}

function mapPost(item: CmsNews): PublicPost {
  return {
    slug: item.slug,
    updatedAt: item.updatedAt || item.publishAt || item.createdAt,
    canonicalUrl: `/blog/${item.slug}`,
    indexable: item.indexable,
    sourceUrl: item.source || "",
    category: item.category || "News",
    title: item.title,
    date: (item.publishAt || item.createdAt).slice(0, 10),
    image: publicArticleImage(item.coverImage),
    text: item.excerpt || item.subtitle || item.title,
    keywords: item.tags.join(", ") || item.title,
    content: lines(item.content || item.excerpt),
  };
}

export async function getPublicProducts() {
  const [cmsProducts, categories] = await Promise.all([cachedCmsProducts(), cachedProductCategories()]);
  const byId = new Map(categories.map((category) => [category.id, category]));
  const cmsMapped = cmsProducts
    .filter((item) => item.status === "published" && publicProductCategory(item.categoryId, byId))
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((item) => mapProduct(item, byId));
  return cmsMapped;
}

export async function getPublicProductNavigation() {
  const [categories, products] = await Promise.all([cachedProductCategories(), getPublicProducts()]);
  return buildProductNavigation(categories, products);
}

export async function getPublicProduct(slug: string) {
  return (await getPublicProducts()).find((item) => item.slug === slug.trim().toLowerCase());
}

export async function getPublicPosts() {
  const cmsNews = await cachedCmsNews();
  const cmsMapped = cmsNews
    .filter((item) => item.status === "published" && !isLegacyImportedBlogSlug(item.slug) && new Date(item.publishAt || item.createdAt).getTime() <= Date.now())
    .sort((a, b) => Number(Boolean(b.pinned)) - Number(Boolean(a.pinned)) || new Date(b.publishAt).getTime() - new Date(a.publishAt).getTime())
    .map(mapPost);
  // A legacy import once created two records with one slug. Keep public routes
  // deterministic even if malformed historical data is encountered again.
  return cmsMapped.filter((post, index, items) => items.findIndex((candidate) => candidate.slug === post.slug) === index);
}

export async function getPublicPost(slug: string) {
  return (await getPublicPosts()).find((item) => item.slug === slug);
}
