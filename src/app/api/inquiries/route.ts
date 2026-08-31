import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { appendStore, createId, readStore } from "@/lib/local-store";
import { scoreLead } from "@/lib/lead-scoring";
import { checkRequestRateLimit } from "@/lib/request-rate-limit";

const inquirySchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(254),
  company: z.string().trim().max(180).optional().default(""),
  phone: z.string().trim().max(80).optional().default(""),
  country: z.string().trim().max(120).optional().default(""),
  product: z.string().trim().max(180).optional().default(""),
  flow: z.string().trim().max(80).optional().default(""),
  head: z.string().trim().max(80).optional().default(""),
  certification: z.string().trim().max(120).optional().default(""),
  message: z.string().trim().max(5000).optional().default(""),
  sourcePage: z.string().trim().max(500).optional().default("website"),
  sourceType: z.string().trim().max(80).optional().default("website_form"),
  jobTitle: z.string().trim().max(120).optional().default(""),
  websiteUrl: z.string().trim().max(500).optional().default(""),
  customerType: z.string().trim().max(120).optional().default(""),
  projectType: z.string().trim().max(120).optional().default(""),
  application: z.string().trim().max(180).optional().default(""),
  voltage: z.string().trim().max(80).optional().default(""),
  frequency: z.string().trim().max(80).optional().default(""),
  quantity: z.string().trim().max(80).optional().default(""),
  purchaseTime: z.string().trim().max(120).optional().default(""),
  projectStage: z.string().trim().max(120).optional().default(""),
  oemOdm: z.boolean().optional().default(false),
  privacyConsent: z.boolean().optional().default(false),
  referrer: z.string().trim().max(1000).optional().default(""),
  utmSource: z.string().trim().max(160).optional().default(""),
  utmMedium: z.string().trim().max(160).optional().default(""),
  utmCampaign: z.string().trim().max(160).optional().default(""),
  website: z.string().trim().max(500).optional().default(""),
});

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const inquiries = await readStore("inquiries.json", []);
  return NextResponse.json({ inquiries });
}

export async function POST(request: Request) {
  const rate = await checkRequestRateLimit(request, "inquiry", { limit: 6, windowMs: 60 * 60 * 1000 });
  if (!rate.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429, headers: { "Retry-After": String(rate.retryAfterSeconds) } });
  }
  const body = await request.json().catch(() => null);
  const parsed = inquirySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid inquiry data" }, { status: 400 });
  }
  if (parsed.data.website) {
    return NextResponse.json({ ok: true });
  }

  const scoring = scoreLead(parsed.data);
  const inquiry = {
    id: createId("inq"),
    createdAt: new Date().toISOString(),
    stage: scoring.status,
    status: "new",
    intent: scoring.score >= 70 ? "A" : scoring.score >= 45 ? "B" : "C",
    score: scoring.score,
    userAgent: request.headers.get("user-agent") || "",
    ...parsed.data,
  };

  await appendStore("inquiries.json", inquiry);
  return NextResponse.json({ ok: true, id: inquiry.id }, { headers: { "Cache-Control": "no-store" } });
}
