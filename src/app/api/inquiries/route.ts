import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { appendStore, createId, readStore } from "@/lib/local-store";
import { scoreLead } from "@/lib/lead-scoring";

const inquirySchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  company: z.string().optional().default(""),
  phone: z.string().optional().default(""),
  country: z.string().optional().default(""),
  product: z.string().optional().default(""),
  flow: z.string().optional().default(""),
  head: z.string().optional().default(""),
  certification: z.string().optional().default(""),
  message: z.string().optional().default(""),
  sourcePage: z.string().optional().default("website"),
  sourceType: z.string().optional().default("website_form"),
  jobTitle: z.string().optional().default(""),
  websiteUrl: z.string().optional().default(""),
  customerType: z.string().optional().default(""),
  projectType: z.string().optional().default(""),
  application: z.string().optional().default(""),
  voltage: z.string().optional().default(""),
  frequency: z.string().optional().default(""),
  quantity: z.string().optional().default(""),
  purchaseTime: z.string().optional().default(""),
  projectStage: z.string().optional().default(""),
  oemOdm: z.boolean().optional().default(false),
  privacyConsent: z.boolean().optional().default(false),
  referrer: z.string().optional().default(""),
  utmSource: z.string().optional().default(""),
  utmMedium: z.string().optional().default(""),
  utmCampaign: z.string().optional().default(""),
  website: z.string().optional().default(""),
});

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const inquiries = await readStore("inquiries.json", []);
  return NextResponse.json({ inquiries });
}

export async function POST(request: Request) {
  const body = await request.json();
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
    ip: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "",
    userAgent: request.headers.get("user-agent") || "",
    ...parsed.data,
  };

  await appendStore("inquiries.json", inquiry);
  return NextResponse.json({ ok: true, inquiry });
}
