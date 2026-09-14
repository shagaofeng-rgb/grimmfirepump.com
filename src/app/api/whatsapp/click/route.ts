import { NextResponse } from "next/server";
import { z } from "zod";
import type { AnalyticsEventRecord, WhatsAppClickRecord } from "@/lib/admin-data";
import { getSiteSettings } from "@/lib/admin-cms";
import { company } from "@/data/site";
import { appendStore, createId, readStore } from "@/lib/local-store";
import { checkRequestRateLimit } from "@/lib/request-rate-limit";

const account = {
  id: "grimm-main",
  label: "GRIMM PUMP Official WhatsApp",
  url: company.whatsappUrl,
};

const clickSchema = z.object({
  accountId: z.literal(account.id).default(account.id),
  targetUrl: z.string().url().max(500),
  placement: z.string().trim().min(2).max(80).default("website"),
  path: z.string().trim().max(500).default("/"),
  label: z.string().trim().max(200).optional().default(""),
  clientClickId: z.string().trim().min(8).max(160),
  visitorId: z.string().trim().max(120).optional().default(""),
  sessionId: z.string().trim().max(120).optional().default(""),
  visitNumber: z.coerce.number().int().min(1).max(100000).optional().default(1),
  referrer: z.string().trim().max(1000).optional().default(""),
  utmSource: z.string().trim().max(160).optional().default(""),
  utmMedium: z.string().trim().max(160).optional().default(""),
  utmCampaign: z.string().trim().max(160).optional().default(""),
  testTraffic: z.boolean().optional().default(false),
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
  return ip.includes(":") ? `${ip.split(":").slice(0, 3).join(":")}::` : "masked";
}

function countryName(code: string) {
  if (!code) return "Unknown";
  try { return new Intl.DisplayNames(["en"], { type: "region" }).of(code) || code; } catch { return code; }
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

async function classifyTraffic(request: Request, input: z.infer<typeof clickSchema>) {
  const host = request.headers.get("host") || "";
  const ua = request.headers.get("user-agent") || "";
  const ip = clientIp(request);
  const settings = await getSiteSettings();
  const excludedIps = [process.env.ANALYTICS_EXCLUDED_IPS || "", settings.analyticsExcludedIps]
    .join(",").split(",").map((item) => item.trim()).filter(Boolean);
  const excludedAgents = [process.env.ANALYTICS_EXCLUDED_USER_AGENTS || "", settings.analyticsExcludedUserAgents]
    .join(",").split(",").map((item) => item.trim().toLowerCase()).filter(Boolean);
  if (host.endsWith(".vercel.app") || host.includes("localhost") || input.testTraffic) return { trafficType: "test" as const, trafficReason: "preview_or_test_environment" };
  if (excludedIps.includes(ip)) return { trafficType: "test" as const, trafficReason: "excluded_ip" };
  if (excludedAgents.some((item) => ua.toLowerCase().includes(item))) return { trafficType: "test" as const, trafficReason: "excluded_user_agent" };
  if (botPattern.test(ua)) return { trafficType: "bot" as const, trafficReason: "automated_user_agent" };
  return { trafficType: "real" as const, trafficReason: "" };
}

function isConfiguredAccountUrl(targetUrl: string) {
  try {
    const supplied = new URL(targetUrl);
    const configured = new URL(account.url);
    return supplied.origin === configured.origin && supplied.pathname === configured.pathname;
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = clickSchema.safeParse(body);
  if (!parsed.success || !isConfiguredAccountUrl(parsed.data.targetUrl)) {
    return NextResponse.json({ error: "Invalid WhatsApp tracking request" }, { status: 400 });
  }
  const rate = await checkRequestRateLimit(request, "whatsapp-click", { limit: 90, windowMs: 10 * 60 * 1000 });
  if (!rate.allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429, headers: { "Retry-After": String(rate.retryAfterSeconds) } });

  const existing = await readStore<WhatsAppClickRecord[]>("whatsapp-clicks.json", []);
  const duplicate = existing.find((item) => item.clientClickId === parsed.data.clientClickId);
  if (duplicate) return NextResponse.json({ ok: true, trackingId: duplicate.id, duplicate: true }, { headers: { "Cache-Control": "no-store" } });

  const traffic = await classifyTraffic(request, parsed.data);
  const countryCode = request.headers.get("x-vercel-ip-country") || "";
  const createdAt = new Date().toISOString();
  const click: WhatsAppClickRecord = {
    id: createId("wa"),
    createdAt,
    accountId: account.id,
    accountLabel: account.label,
    targetUrl: account.url,
    placement: parsed.data.placement,
    path: parsed.data.path,
    visitorId: parsed.data.visitorId,
    sessionId: parsed.data.sessionId,
    visitNumber: parsed.data.visitNumber,
    countryCode,
    country: countryName(countryCode),
    region: request.headers.get("x-vercel-ip-country-region") || "",
    city: request.headers.get("x-vercel-ip-city") || "",
    channel: channelFor(parsed.data),
    referrer: parsed.data.referrer,
    utmSource: parsed.data.utmSource,
    utmMedium: parsed.data.utmMedium,
    utmCampaign: parsed.data.utmCampaign,
    ipMasked: maskIp(clientIp(request)),
    userAgent: request.headers.get("user-agent") || "",
    clientClickId: parsed.data.clientClickId,
    ...traffic,
  };
  const event: AnalyticsEventRecord = {
    id: `evt_${click.id}`,
    createdAt,
    event: "whatsapp_click",
    path: click.path,
    label: parsed.data.label,
    metadata: {
      accountId: click.accountId,
      accountLabel: click.accountLabel,
      placement: click.placement,
      targetUrl: click.targetUrl,
      whatsappClickId: click.id,
    },
    visitorId: click.visitorId,
    sessionId: click.sessionId,
    visitNumber: click.visitNumber,
    country: click.country,
    countryCode: click.countryCode,
    region: click.region,
    city: click.city,
    channel: click.channel,
    referrer: click.referrer,
    utmSource: click.utmSource,
    utmMedium: click.utmMedium,
    utmCampaign: click.utmCampaign,
    ipMasked: click.ipMasked,
    userAgent: click.userAgent,
    trafficType: click.trafficType,
    trafficReason: click.trafficReason,
  };

  await appendStore("whatsapp-clicks.json", click);
  await appendStore("analytics-events.json", event);
  return NextResponse.json({ ok: true, trackingId: click.id, accountId: click.accountId }, { headers: { "Cache-Control": "no-store" } });
}
