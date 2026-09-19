import type { MetadataRoute } from "next";
import { company } from "@/data/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/admin/", "/api/", "/search", "/es/search", "/ru/search", "/ar/search", "/fr/search", "/pt/search"] },
      { userAgent: "Googlebot", allow: "/" },
      { userAgent: "Bingbot", allow: "/" },
      { userAgent: "OAI-SearchBot", allow: "/" },
      { userAgent: "PerplexityBot", allow: "/" },
    ],
    sitemap: `${company.website}/sitemap.xml`,
    host: company.website,
  };
}
