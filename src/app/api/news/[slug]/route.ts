import { NextResponse } from "next/server";
import { getNewsArticle } from "@/lib/news-automation";

type RouteProps = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: RouteProps) {
  const { slug } = await params;
  const article = await getNewsArticle(slug);
  if (!article) {
    return NextResponse.json({ error: "News article not found" }, { status: 404 });
  }
  return NextResponse.json({ article });
}
