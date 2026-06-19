import { NextResponse } from "next/server";
import { z } from "zod";
import { appendStore, createId, readStore } from "@/lib/local-store";

const eventSchema = z.object({
  event: z.string().min(2),
  path: z.string().optional().default(""),
  label: z.string().optional().default(""),
  metadata: z.record(z.string(), z.unknown()).optional().default({}),
});

export async function GET() {
  const events = await readStore<Array<{ event: string; createdAt: string }>>("analytics-events.json", []);
  const counts = events.reduce<Record<string, number>>((acc, item) => {
    acc[item.event] = (acc[item.event] || 0) + 1;
    return acc;
  }, {});
  return NextResponse.json({ events: events.slice(0, 100), counts });
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = eventSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid analytics event" }, { status: 400 });
  }

  const event = {
    id: createId("evt"),
    createdAt: new Date().toISOString(),
    ...parsed.data,
  };

  await appendStore("analytics-events.json", event);
  return NextResponse.json({ ok: true });
}
