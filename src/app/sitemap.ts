import type { MetadataRoute } from "next";
import { applications, company, posts, products } from "@/data/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    "",
    "/about",
    "/products",
    "/products/ul-fire-pump-systems",
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
    ...posts.map((item) => `/knowledge/${item.slug}`),
  ].map((path) => ({
    url: `${company.website}${path}`,
    lastModified: now,
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.75,
  }));
}
