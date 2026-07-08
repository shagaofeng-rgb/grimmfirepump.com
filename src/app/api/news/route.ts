import { NextResponse } from "next/server";
import { listPublishedNews } from "@/lib/news-automation";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const page = Math.max(1, Number(url.searchParams.get("page") || 1));
  const pageSize = Math.min(50, Math.max(1, Number(url.searchParams.get("pageSize") || 12)));
  const category = url.searchParams.get("category") || "";
  const all = await listPublishedNews();
  const filtered = category ? all.filter((item) => item.category.toLowerCase() === category.toLowerCase()) : all;
  const start = (page - 1) * pageSize;
  return NextResponse.json({
    items: filtered.slice(start, start + pageSize),
    total: filtered.length,
    page,
    pageSize,
  });
}
