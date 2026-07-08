import { company } from "@/data/site";
import { listPublishedNews } from "@/lib/news-automation";

export const dynamic = "force-dynamic";

function escapeXml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export async function GET() {
  const news = await listPublishedNews();
  const items = news
    .slice(0, 50)
    .map((item) => {
      const url = `${company.website}/news/${item.slug}`;
      return `<item>
  <title>${escapeXml(item.title)}</title>
  <link>${url}</link>
  <guid isPermaLink="true">${url}</guid>
  <pubDate>${new Date(item.publishAt || item.sourcePublishedAt).toUTCString()}</pubDate>
  <description>${escapeXml(item.summary)}</description>
  <enclosure url="${escapeXml(item.coverImageUrl)}" type="image/jpeg" />
</item>`;
    })
    .join("\n");

  return new Response(`<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
  <title>GRIMM PUMP Fire Pump Industry News</title>
  <link>${company.website}/news</link>
  <description>Recent fire pump industry news with GRIMM engineering context.</description>
  <language>en</language>
  ${items}
</channel>
</rss>`, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "s-maxage=900, stale-while-revalidate=3600",
    },
  });
}
