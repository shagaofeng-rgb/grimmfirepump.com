import { NextResponse } from "next/server";
import { listPublishedNews } from "@/lib/news-automation";

export const dynamic = "force-dynamic";

export async function GET() {
  const news = await listPublishedNews();
  const categories = Object.entries(
    news.reduce<Record<string, number>>((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {}),
  ).map(([name, count]) => ({ name, count }));
  return NextResponse.json({ categories });
}
