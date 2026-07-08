import { company } from "@/data/site";
import { getPublicPosts } from "@/lib/public-cms";

export const dynamic = "force-dynamic";

function escapeXml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export async function GET() {
  const posts = await getPublicPosts();
  const items = posts
    .slice(0, 50)
    .map((item) => {
      const url = `${company.website}/blog/${item.slug}`;
      return `<item>
  <title>${escapeXml(item.title)}</title>
  <link>${url}</link>
  <guid isPermaLink="true">${url}</guid>
  <pubDate>${new Date(item.date).toUTCString()}</pubDate>
  <description>${escapeXml(item.text)}</description>
  <enclosure url="${escapeXml(item.image.startsWith("http") ? item.image : `${company.website}${item.image}`)}" type="image/jpeg" />
</item>`;
    })
    .join("\n");

  return new Response(`<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
  <title>GRIMM PUMP Blog and Company Updates</title>
  <link>${company.website}/blog</link>
  <description>GRIMM PUMP company updates, fire pump product articles and application knowledge.</description>
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
