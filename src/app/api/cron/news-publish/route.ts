import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { runNewsPublish } from "@/lib/news-automation";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function authorized(request: Request) {
  const secret = process.env.NEWS_CRON_SECRET || process.env.CRON_SECRET;
  return Boolean(secret) && request.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  if (!authorized(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const result = await runNewsPublish("cron", { dryRun: new URL(request.url).searchParams.get("dryRun") === "1" });
  if (result.ok && !result.skipped) {
    revalidateTag("news-articles"); revalidateTag("sitemap-data"); revalidatePath("/news"); revalidatePath("/news-sitemap.xml");
  }
  return NextResponse.json(result, { status: result.ok ? 200 : 500 });
}

export async function POST(request: Request) { return GET(request); }
