import { buildSitemapBundle } from "@/lib/sitemap-service";

export const dynamic = "force-dynamic";

export async function GET() {
  const bundle = await buildSitemapBundle();
  return new Response(bundle.indexXml, {
    headers: {
      "content-type": "application/xml; charset=utf-8",
      "cache-control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
      "x-sitemap-urls": String(bundle.entries.length),
    },
  });
}
