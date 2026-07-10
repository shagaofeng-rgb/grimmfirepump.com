import { buildSitemapBundle } from "@/lib/sitemap-service";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<{ file: string }> }) {
  const { file } = await context.params;
  if (!/^(pages|products|posts|categories)-\d+\.xml$/.test(file)) return new Response("Not found", { status: 404 });
  const bundle = await buildSitemapBundle();
  const chunk = bundle.chunks.find((item) => item.fileName === file);
  if (!chunk) return new Response("Not found", { status: 404 });
  return new Response(chunk.xml, {
    headers: {
      "content-type": "application/xml; charset=utf-8",
      "cache-control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
      "x-sitemap-urls": String(chunk.entries.length),
    },
  });
}
