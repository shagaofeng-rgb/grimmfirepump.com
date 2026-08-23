import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import type { AnalyticsEventRecord } from "@/lib/admin-data";
import { getSiteSettings } from "@/lib/admin-cms";
import { appendStore, createId, readStore } from "@/lib/local-store";

const eventSchema = z.object({
  event: z.string().min(2).max(80),
  path: z.string().max(500).optional().default(""),
  label: z.string().max(200).optional().default(""),
  visitorId: z.string().max(120).optional().default(""),
  sessionId: z.string().max(120).optional().default(""),
  visitNumber: z.number().int().min(1).max(100000).optional().default(1),
  referrer: z.string().max(1000).optional().default(""),
  utmSource: z.string().max(160).optional().default(""),
  utmMedium: z.string().max(160).optional().default(""),
  utmCampaign: z.string().max(160).optional().default(""),
  metadata: z.record(z.string(), z.unknown()).optional().default({}),
});

const botPattern = /(bot|crawler|spider|lighthouse|headless|playwright|puppeteer|selenium|curl|wget|collects)/i;
const socialPattern = /(facebook|instagram|linkedin|tiktok|youtube|x\.com|twitter|pinterest)/i;
const searchPattern = /(google|bing|yahoo|baidu|duckduckgo|yandex)/i;

function clientIp(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || request.headers.get("x-real-ip")?.trim()
    || "";
}

function maskIp(ip: string) {
  if (!ip) return "";
  if (ip.includes(".")) {
    const parts = ip.split(".");
    return parts.length === 4 ? `${parts[0]}.${parts[1]}.${parts[2]}.0` : "masked";
  }
  return ip.includes(":") ? ip.split(":").slice(0, 3).join(":") + "::" : "masked";
}

function channelFor(input: { referrer: string; utmSource: string; utmMedium: string }) {
  const referrer = input.referrer.toLowerCase();
  const medium = input.utmMedium.toLowerCase();
  if (medium.includes("cpc") || medium.includes("paid") || medium.includes("ppc")) return "Paid";
  if (input.utmSource || medium.includes("email")) return medium.includes("email") ? "Email" : "Campaign";
  if (searchPattern.test(referrer)) return "Organic search";
  if (socialPattern.test(referrer)) return "Social";
  if (referrer) return "Referral";
  return "Direct";
}

async function classifyTraffic(request: Request, input: z.infer<typeof eventSchema>) {
  const host = request.headers.get("host") || "";
  const ua = request.headers.get("user-agent") || "";
  const ip = clientIp(request);
  const settings = await getSiteSettings();
  const excludedIps = [process.env.ANALYTICS_EXCLUDED_IPS || "", settings.analyticsExcludedIps].join(",").split(",").map((item) => item.trim()).filter(Boolean);
  const excludedAgents = [process.env.ANALYTICS_EXCLUDED_USER_AGENTS || "", settings.analyticsExcludedUserAgents].join(",").split(",").map((item) => item.trim().toLowerCase()).filter(Boolean);
  const flaggedByClient = input.metadata.testTraffic === true || input.metadata.previewTraffic === true;
  if (host.endsWith(".vercel.app") || host.includes("localhost") || flaggedByClient) return { trafficType: "test" as const, trafficReason: "preview_or_test_environment" };
  if (excludedIps.includes(ip)) return { trafficType: "test" as const, trafficReason: "excluded_ip" };
  if (excludedAgents.some((item) => ua.toLowerCase().includes(item))) return { trafficType: "test" as const, trafficReason: "excluded_user_agent" };
  if (botPattern.test(ua)) return { trafficType: "bot" as const, trafficReason: "automated_user_agent" };
  return { trafficType: "real" as const, trafficReason: "" };
}

export async function GET(request: Request) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const params = new URL(request.url).searchParams;
  const limit = Math.min(Math.max(Number(params.get("limit") || 100), 1), 500);
  const events = await readStore<AnalyticsEventRecord[]>("analytics-events.json", []);
  const counts = events.reduce<Record<string, number>>((acc, item) => {
    acc[item.event] = (acc[item.event] || 0) + 1;
    return acc;
  }, {});
  return NextResponse.json({ events: events.slice(0, limit), counts });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = eventSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid analytics event" }, { status: 400 });

  const traffic = await classifyTraffic(request, parsed.data);
  const event: AnalyticsEventRecord = {
    id: createId("evt"),
    createdAt: new Date().toISOString(),
    ...parsed.data,
    countryCode: request.headers.get("x-vercel-ip-country") || "",
    country: request.headers.get("x-vercel-ip-country") || "Unknown",
    region: request.headers.get("x-vercel-ip-country-region") || "",
    city: request.headers.get("x-vercel-ip-city") || "",
    userAgent: request.headers.get("user-agent") || "",
    ipMasked: maskIp(clientIp(request)),
    channel: channelFor(parsed.data),
    ...traffic,
  };

  await appendStore("analytics-events.json", event);
  return NextResponse.json({ ok: true, trafficType: event.trafficType });
}
