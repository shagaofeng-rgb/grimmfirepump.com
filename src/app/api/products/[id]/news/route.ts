import { NextResponse } from "next/server";
import { getRelatedNewsForProduct } from "@/lib/news-automation";

type RouteProps = { params: Promise<{ id: string }> };

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: RouteProps) {
  const { id } = await params;
  const items = await getRelatedNewsForProduct(id, 12);
  return NextResponse.json({ items });
}
