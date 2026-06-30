import type { MetadataRoute } from "next";
import { applications, company, knowledgePosts, posts, products } from "@/data/site";
import { localizedLocales, localizedPath, supportedLocalizedPaths } from "@/lib/i18n";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
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
    "/blog",
    "/knowledge",
    "/contact",
    ...products.map((item) => `/products/${item.slug}`),
    ...applications.map((item) => `/applications/${item.slug}`),
    ...posts.map((item) => `/blog/${item.slug}`),
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
