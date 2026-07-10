import { NextResponse } from "next/server";
import { runNewsAutomation } from "@/lib/news-automation";
import { revalidatePath, revalidateTag } from "next/cache";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function authorized(request: Request) {
  const secret = process.env.NEWS_CRON_SECRET || process.env.CRON_SECRET;
  if (!secret) return process.env.NODE_ENV !== "production";
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const result = await runNewsAutomation("cron");
  revalidateTag("cms-blog");
  revalidateTag("news-articles");
  revalidateTag("sitemap-data");
  revalidatePath("/news");
  revalidatePath("/blog");
  revalidatePath("/sitemap.xml");
  return NextResponse.json(result, { status: result.ok ? 200 : 500 });
}

export async function POST(request: Request) {
  return GET(request);
}
