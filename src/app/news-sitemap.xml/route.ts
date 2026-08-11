import { company } from "@/data/site";
import { listPublishedNews } from "@/lib/news-automation";

export const dynamic = "force-dynamic";

function escapeXml(value: string) { return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;"); }

export async function GET() {
  const entries = await listPublishedNews();
  const urls = entries.map((item) => `  <url><loc>${escapeXml(`${company.website}/news/${item.slug}`)}</loc><lastmod>${escapeXml((item.updatedAt || item.publishAt || item.createdAt).slice(0, 10))}</lastmod></url>`).join("\n");
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`, { headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "s-maxage=300, stale-while-revalidate=600" } });
}
