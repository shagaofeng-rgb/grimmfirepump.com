import type { MetadataRoute } from "next";
import { applications, company, knowledgePosts } from "@/data/site";
import { localizedLocales, localizedPath, supportedLocalizedPaths } from "@/lib/i18n";
import { getPublicPosts, getPublicProducts } from "@/lib/public-cms";
import { listPublishedNews } from "@/lib/news-automation";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const [products, posts, news] = await Promise.all([getPublicProducts(), getPublicPosts(), listPublishedNews()]);
  const englishPaths = [
    "",
    "/about",
    "/products",
    "/applications",
    "/projects",
    "/factory",
    "/testing",
    "/certificates",
    "/downloads",
    "/news",
    "/blog",
    "/knowledge",
    "/contact",
    "/search",
    ...products.map((item) => `/products/${item.slug}`),
    ...applications.map((item) => `/applications/${item.slug}`),
    ...posts.map((item) => `/blog/${item.slug}`),
    ...news.map((item) => `/news/${item.slug}`),
    ...knowledgePosts.map((item) => `/knowledge/${item.slug}`),
  ];
  const localizedPaths = localizedLocales.flatMap((locale) =>
    supportedLocalizedPaths.map((path) => localizedPath(path, locale)),
  );

  return [...englishPaths, ...localizedPaths].map((path) => ({
    url: `${company.website}${path === "/" ? "" : path}`,
    lastModified: now,
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.75,
  }));
}
