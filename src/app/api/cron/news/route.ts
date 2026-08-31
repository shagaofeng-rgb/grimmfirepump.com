import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
function retired() {
  return NextResponse.json(
    { error: "Retired endpoint. Use the separate News ingest and publish schedules." },
    { status: 410, headers: { "Cache-Control": "no-store" } },
  );
}

export async function GET() { return retired(); }
export async function POST() { return retired(); }
