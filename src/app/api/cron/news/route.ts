import { NextResponse } from "next/server";
import { runNewsAutomation } from "@/lib/news-automation";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function authorized(request: Request) {
  const secret = process.env.NEWS_CRON_SECRET || process.env.CRON_SECRET;
  const userAgent = request.headers.get("user-agent") || "";
  const fromVercelCron = userAgent.toLowerCase().includes("vercel-cron") || Boolean(request.headers.get("x-vercel-cron"));
  if (!secret) return process.env.NODE_ENV !== "production" || fromVercelCron;
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const result = await runNewsAutomation("cron");
  return NextResponse.json(result, { status: result.ok ? 200 : 500 });
}

export async function POST(request: Request) {
  return GET(request);
}
