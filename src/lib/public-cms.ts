import { posts as staticPosts, products as staticProducts } from "@/data/site";
import { listCmsNews, listCmsProducts, type CmsNews, type CmsProduct } from "@/lib/admin-cms";
import { unstable_cache } from "next/cache";

const cachedCmsProducts = unstable_cache(listCmsProducts, ["public-cms-products-v1"], { revalidate: 300, tags: ["cms-products"] });
const cachedCmsNews = unstable_cache(listCmsNews, ["public-cms-blog-v1"], { revalidate: 300, tags: ["cms-blog"] });

export type PublicProduct = {
  slug: string;
  updatedAt: string;
  canonicalUrl: string;
  indexable: boolean;
  sourceUrl: string;
  title: string;
  category: string;
  releaseTime: string;
  image: string;
  summary: string;
  description: string;
  specs: string[];
  keywords: string;
  detailLines: string[];
  detailImages: Array<{ src: string; alt: string }>;
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

function productSpecs(item: CmsProduct, fallback?: PublicProduct) {
  const params = item.parameters.map((param) => [param.name, param.value, param.unit].filter(Boolean).join(": "));
  return (params.length ? params : [...lines(item.sellingPoints), ...(fallback?.specs || [])]).slice(0, 12);
}

function productDetailLines(item: CmsProduct, fallback?: PublicProduct) {
  return [
    item.description,
    item.sellingPoints,
    item.applications,
    item.structure,
    item.selectionGuide,
    item.installation,
    item.afterSales,
    ...(fallback?.detailLines || []),
  ].flatMap(lines);
}

function mapProduct(item: CmsProduct): PublicProduct {
  const fallback = staticProducts.find((product) => product.slug === item.slug) as PublicProduct | undefined;
  const image = item.mainImage || fallback?.image || "/assets/products/edj-package.webp";
  const gallery = item.gallery.length ? item.gallery : fallback?.detailImages?.map((detail) => detail.src) || [image];
  return {
    slug: item.slug,
    updatedAt: item.updatedAt || item.createdAt,
    canonicalUrl: item.canonicalUrl || `/products/${item.slug}`,
    indexable: item.indexable,
    sourceUrl: fallback?.sourceUrl || item.canonicalUrl || `/products/${item.slug}`,
    title: item.title,
    category: item.categoryName || fallback?.category || "Products",
    releaseTime: fallback?.releaseTime || item.createdAt.slice(0, 10),
    image,
    summary: item.summary || fallback?.summary || item.description,
    description: item.description || fallback?.description || item.summary,
    specs: productSpecs(item, fallback),
    keywords: item.seoKeywords || fallback?.keywords || item.title,
    detailLines: productDetailLines(item, fallback),
    detailImages: gallery.map((src) => ({ src, alt: item.title })),
  };
}

function mapStaticProduct(item: (typeof staticProducts)[number]): PublicProduct {
  return {
    slug: item.slug,
    updatedAt: item.releaseTime,
    canonicalUrl: `/products/${item.slug}`,
    indexable: true,
    sourceUrl: item.sourceUrl,
    title: item.title,
    category: item.category,
    releaseTime: item.releaseTime,
    image: item.image,
    summary: item.summary,
    description: item.description,
    specs: item.specs,
    keywords: item.keywords,
    detailLines: item.detailLines,
    detailImages: "detailImages" in item && Array.isArray(item.detailImages) ? item.detailImages : [{ src: item.image, alt: item.title }],
  };
}

function mapPost(item: CmsNews): PublicPost {
  const fallback = staticPosts.find((post) => post.slug === item.slug) as PublicPost | undefined;
  return {
    slug: item.slug,
    updatedAt: item.updatedAt || item.publishAt || item.createdAt,
    canonicalUrl: `/blog/${item.slug}`,
    indexable: item.indexable,
    sourceUrl: item.source || fallback?.sourceUrl || `/blog/${item.slug}`,
    category: item.category || fallback?.category || "News",
    title: item.title,
    date: (item.publishAt || item.createdAt).slice(0, 10),
    image: item.coverImage || fallback?.image || "/assets/applications/hero-edj.webp",
    text: item.excerpt || item.subtitle || fallback?.text || item.title,
    keywords: item.tags.join(", ") || fallback?.keywords || item.title,
    content: lines(item.content || fallback?.content?.join("\n\n") || item.excerpt),
  };
}

function mapStaticPost(item: (typeof staticPosts)[number]): PublicPost {
  return {
    slug: item.slug,
    updatedAt: item.date,
    canonicalUrl: `/blog/${item.slug}`,
    indexable: true,
    sourceUrl: item.sourceUrl,
    category: item.category,
    title: item.title,
    date: item.date,
    image: item.image,
    text: item.text,
    keywords: item.keywords,
    content: item.content,
  };
}

export async function getPublicProducts() {
  const cmsProducts = await cachedCmsProducts();
  const cmsMapped = cmsProducts
    .filter((item) => item.status === "published")
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map(mapProduct);
  const cmsSlugs = new Set(cmsProducts.map((item) => item.slug));
  const fallbackProducts = staticProducts.filter((item) => !cmsSlugs.has(item.slug)).map(mapStaticProduct);
  return [...cmsMapped, ...fallbackProducts];
}

export async function getPublicProduct(slug: string) {
  return (await getPublicProducts()).find((item) => item.slug === slug);
}

export async function getPublicPosts() {
  const cmsNews = await cachedCmsNews();
  const cmsMapped = cmsNews
    .filter((item) => item.status === "published" && new Date(item.publishAt || item.createdAt).getTime() <= Date.now())
    .sort((a, b) => Number(Boolean(b.pinned)) - Number(Boolean(a.pinned)) || new Date(b.publishAt).getTime() - new Date(a.publishAt).getTime())
    .map(mapPost);
  const cmsSlugs = new Set(cmsNews.map((item) => item.slug));
  const fallbackPosts = staticPosts.filter((item) => !cmsSlugs.has(item.slug)).map(mapStaticPost);
  return [...cmsMapped, ...fallbackPosts];
}

export async function getPublicPost(slug: string) {
  return (await getPublicPosts()).find((item) => item.slug === slug);
}
