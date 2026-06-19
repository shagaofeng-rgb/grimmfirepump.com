import { NextResponse } from "next/server";
import { z } from "zod";
import { appendStore, createId, readStore } from "@/lib/local-store";

const downloadLeadSchema = z.object({
  assetTitle: z.string().min(2),
  name: z.string().min(2),
  email: z.string().email(),
  country: z.string().optional().default(""),
  company: z.string().optional().default(""),
  sourcePage: z.string().optional().default("/downloads"),
  website: z.string().optional().default(""),
});

export async function GET() {
  const leads = await readStore("download-leads.json", []);
  return NextResponse.json({ leads });
}

export async function POST(request: Request) {
  const body = await request.json();
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
  return NextResponse.json({ ok: true, lead, file: "/assets/downloads/grimm-fire-pump-catalog.pdf" });
}
