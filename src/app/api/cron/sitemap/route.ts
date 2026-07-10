import { NextResponse } from "next/server";
import { runSitemapMaintenance } from "@/lib/sitemap-service";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function authorized(request: Request) {
  const secret = process.env.SITEMAP_CRON_SECRET || process.env.CRON_SECRET;
  if (!secret) return process.env.NODE_ENV !== "production";
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  if (!authorized(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const result = await runSitemapMaintenance({ trigger: "cron", submit: true });
  return NextResponse.json(result, { status: result.status === "failed" ? 500 : 200 });
}

export async function POST(request: Request) {
  return GET(request);
}
