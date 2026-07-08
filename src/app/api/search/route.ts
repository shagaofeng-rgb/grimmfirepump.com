import { NextResponse } from "next/server";
import { getPublicPosts, getPublicProducts } from "@/lib/public-cms";
import { listPublishedNews } from "@/lib/news-automation";

export const dynamic = "force-dynamic";

function score(text: string, query: string) {
  const haystack = text.toLowerCase();
  const terms = query.toLowerCase().split(/[^a-z0-9]+/).filter((term) => term.length > 1);
  return terms.reduce((sum, term) => sum + (haystack.includes(term) ? 1 : 0), 0);
}

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q")?.trim() || "";
  if (!query) return NextResponse.json({ items: [], total: 0, query });

  const [products, posts, news] = await Promise.all([getPublicProducts(), getPublicPosts(), listPublishedNews()]);
  const items = [
    ...products.map((item) => ({
      type: "Product",
      title: item.title,
      summary: item.summary,
      image: item.image,
      href: `/products/${item.slug}`,
      text: `${item.title} ${item.category} ${item.summary} ${item.description} ${item.keywords}`,
    })),
    ...news.map((item) => ({
      type: "News",
      title: item.title,
      summary: item.summary,
      image: item.coverImageUrl,
      href: `/news/${item.slug}`,
      text: `${item.title} ${item.category} ${item.summary} ${item.body.join(" ")}`,
    })),
    ...posts.map((item) => ({
      type: "Blog",
      title: item.title,
      summary: item.text,
      image: item.image,
      href: `/blog/${item.slug}`,
      text: `${item.title} ${item.category} ${item.text} ${item.content.join(" ")}`,
    })),
  ]
    .map((item) => ({ ...item, score: score(item.text, query) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 30)
    .map(({ text, ...item }) => item);

  return NextResponse.json({ items, total: items.length, query });
}
