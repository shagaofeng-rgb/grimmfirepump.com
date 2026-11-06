import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { insertStoreItem, readStore, readStoreItem, submissionId } from "@/lib/local-store";
import { checkRequestRateLimit } from "@/lib/request-rate-limit";
import { listDownloadAssets } from "@/lib/admin-cms";

const downloadLeadSchema = z.object({
  assetId: z.string().trim().min(2).max(180),
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(254),
  country: z.string().trim().max(120).optional().default(""),
  company: z.string().trim().max(180).optional().default(""),
  sourcePage: z.string().trim().max(500).optional().default("/downloads"),
  website: z.string().trim().max(500).optional().default(""),
  submissionToken: z.string().uuid().optional(),
  visitorId: z.string().max(120).optional().default(""),
  sessionId: z.string().max(120).optional().default(""),
});

export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin || !["super_admin", "sales"].includes(admin.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const leads = await readStore("download-leads.json", []);
  return NextResponse.json({ leads }, { headers: { "Cache-Control": "private, no-store" } });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = downloadLeadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid download lead data" }, { status: 400 });
  }
  if (parsed.data.website) {
    return NextResponse.json({ ok: true });
  }

  const published = (await listDownloadAssets()).filter((item) => item.status === "published" && item.fileUrl);
  const asset = published.find((item) => item.id === parsed.data.assetId);
  const uniqueAsset = asset && published.find((item) => item.fileUrl === asset.fileUrl)?.id === asset.id;
  if (!asset || !uniqueAsset || !asset.gated || !(asset.fileUrl.startsWith("/") && !asset.fileUrl.startsWith("//") || asset.fileUrl.startsWith("https://"))) {
    return NextResponse.json({ error: "Document unavailable" }, { status: 404 });
  }
  const { submissionToken, website: _honeypot, ...data } = parsed.data;
  const id = submissionId("dl", submissionToken, `${asset.id}:${data.email.toLowerCase()}`);
  const headers = { "Cache-Control": "no-store" };
  if (submissionToken && await readStoreItem("download-leads.json", id)) {
    return NextResponse.json({ ok: true, id, file: asset.fileUrl, duplicate: true }, { headers });
  }
  const rate = await checkRequestRateLimit(request, "download", { limit: 12, windowMs: 60 * 60 * 1000 });
  if (!rate.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429, headers: { "Retry-After": String(rate.retryAfterSeconds) } });
  }

  const lead = {
    id,
    createdAt: new Date().toISOString(),
    ...data,
    assetTitle: asset.title,
  };

  const inserted = await insertStoreItem("download-leads.json", lead);
  return NextResponse.json({ ok: true, id, file: asset.fileUrl, ...(!inserted ? { duplicate: true } : {}) }, { headers });
}
