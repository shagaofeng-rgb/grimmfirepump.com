import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentAdmin } from "@/lib/admin-auth";
import type { AnalyticsEventRecord } from "@/lib/admin-data";
import { appendStore, createId, readStore } from "@/lib/local-store";
import { checkRequestRateLimit } from "@/lib/request-rate-limit";
import { classifyTraffic, externalReferrer, trafficChannel, trafficLocation } from "@/lib/traffic-context";

const eventSchema = z.object({
  event: z.enum(["page_view", "cta_click", "download_click", "inquiry_submit", "quote_request", "facebook_click", "youtube_click", "form_open", "form_start"]),
  path: z.string().max(500).regex(/^\/(?![\/\\])[^?#]*$/),
  label: z.string().max(200).optional().default(""),
  visitorId: z.string().max(120).optional().default(""),
  sessionId: z.string().max(120).optional().default(""),
  visitNumber: z.number().int().min(1).max(100000).optional().default(1),
  referrer: z.string().max(1000).optional().default(""),
  utmSource: z.string().max(160).optional().default(""),
  utmMedium: z.string().max(160).optional().default(""),
  utmCampaign: z.string().max(160).optional().default(""),
  metadata: z.object({ href: z.string().max(500).optional(), pageTitle: z.string().max(300).optional(), testTraffic: z.boolean().optional(), previewTraffic: z.boolean().optional() }).optional().default({}),
});


export async function GET(request: Request) {
  const admin = await getCurrentAdmin();
  if (!admin || !["super_admin", "analyst"].includes(admin.role)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const params = new URL(request.url).searchParams;
  const limit = Math.min(Math.max(Number(params.get("limit")) || 100, 1), 500);
  const events = await readStore<AnalyticsEventRecord[]>("analytics-events.json", []);
  const counts = events.reduce<Record<string, number>>((acc, item) => {
    acc[item.event] = (acc[item.event] || 0) + 1;
    return acc;
  }, {});
  return NextResponse.json({ events: events.slice(0, limit), counts }, { headers: { "Cache-Control": "private, no-store" } });
}

export async function POST(request: Request) {
  const rate = await checkRequestRateLimit(request, "analytics", { limit: 180, windowMs: 10 * 60 * 1000 });
  if (!rate.allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429, headers: { "Retry-After": String(rate.retryAfterSeconds) } });
  const body = await request.json().catch(() => null);
  const parsed = eventSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid analytics event" }, { status: 400 });

  const traffic = await classifyTraffic(request, parsed.data.path, parsed.data.metadata.testTraffic === true || parsed.data.metadata.previewTraffic === true);
  const event: AnalyticsEventRecord = {
    id: createId("evt"),
    createdAt: new Date().toISOString(),
    ...parsed.data,
    referrer: externalReferrer(parsed.data.referrer),
    ...trafficLocation(request),
    channel: trafficChannel(parsed.data),
    ...traffic,
  };

  await appendStore("analytics-events.json", event);
  return NextResponse.json({ ok: true, trafficType: event.trafficType });
}
