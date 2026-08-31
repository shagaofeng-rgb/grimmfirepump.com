import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { appendStore, createId, readStore } from "@/lib/local-store";
import { checkRequestRateLimit } from "@/lib/request-rate-limit";

const downloadLeadSchema = z.object({
  assetTitle: z.string().trim().min(2).max(180),
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(254),
  country: z.string().trim().max(120).optional().default(""),
  company: z.string().trim().max(180).optional().default(""),
  sourcePage: z.string().trim().max(500).optional().default("/downloads"),
  website: z.string().trim().max(500).optional().default(""),
});

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const leads = await readStore("download-leads.json", []);
  return NextResponse.json({ leads });
}

export async function POST(request: Request) {
  const rate = await checkRequestRateLimit(request, "download", { limit: 12, windowMs: 60 * 60 * 1000 });
  if (!rate.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429, headers: { "Retry-After": String(rate.retryAfterSeconds) } });
  }
  const body = await request.json().catch(() => null);
  const parsed = downloadLeadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid download lead data" }, { status: 400 });
  }
  if (parsed.data.website) {
    return NextResponse.json({ ok: true });
  }

  const lead = {
    id: createId("dl"),
    createdAt: new Date().toISOString(),
    ...parsed.data,
  };

  await appendStore("download-leads.json", lead);
  return NextResponse.json({ ok: true, id: lead.id, file: "/assets/downloads/grimm-fire-pump-catalog.pdf" }, { headers: { "Cache-Control": "no-store" } });
}
