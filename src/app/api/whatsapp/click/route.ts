import { NextResponse } from "next/server";
import { z } from "zod";
import type { AnalyticsEventRecord, WhatsAppClickRecord } from "@/lib/admin-data";
import { company } from "@/data/site";
import { insertStoreItem, readStoreItem, submissionId } from "@/lib/local-store";
import { checkRequestRateLimit } from "@/lib/request-rate-limit";
import { classifyTraffic, externalReferrer, trafficChannel, trafficLocation } from "@/lib/traffic-context";

const account = {
  id: "grimm-main",
  label: "GRIMM PUMP Official WhatsApp",
  url: company.whatsappUrl,
};

const clickSchema = z.object({
  accountId: z.literal(account.id).default(account.id),
  targetUrl: z.string().url().max(500),
  placement: z.string().trim().min(2).max(80).default("website"),
  path: z.string().trim().max(500).regex(/^\/(?![\/\\])[^?#]*$/).default("/"),
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

  const id = submissionId("wa", parsed.data.clientClickId, account.id);
  const previous = await readStoreItem<WhatsAppClickRecord>("whatsapp-clicks.json", id);
  const traffic = previous || await classifyTraffic(request, parsed.data.path, parsed.data.testTraffic);
  const createdAt = new Date().toISOString();
  const candidate: WhatsAppClickRecord = {
    id,
    createdAt,
    accountId: account.id,
    accountLabel: account.label,
    targetUrl: account.url,
    placement: parsed.data.placement,
    path: parsed.data.path,
    visitorId: parsed.data.visitorId,
    sessionId: parsed.data.sessionId,
    visitNumber: parsed.data.visitNumber,
    ...trafficLocation(request),
    channel: trafficChannel(parsed.data),
    referrer: externalReferrer(parsed.data.referrer),
    utmSource: parsed.data.utmSource,
    utmMedium: parsed.data.utmMedium,
    utmCampaign: parsed.data.utmCampaign,
    clientClickId: parsed.data.clientClickId,
    trafficType: traffic.trafficType,
    trafficReason: traffic.trafficReason,
  };
  const inserted = !previous && await insertStoreItem("whatsapp-clicks.json", candidate);
  const click = inserted ? candidate : previous || await readStoreItem<WhatsAppClickRecord>("whatsapp-clicks.json", id);
  if (!click) return NextResponse.json({ error: "Unable to record the click" }, { status: 503 });
  const event: AnalyticsEventRecord = {
    id: `evt_${click.id}`,
    createdAt: click.createdAt,
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

  await insertStoreItem("analytics-events.json", event);
  return NextResponse.json({ ok: true, trackingId: click.id, accountId: click.accountId, ...(!inserted ? { duplicate: true } : {}) }, { headers: { "Cache-Control": "no-store" } });
}
