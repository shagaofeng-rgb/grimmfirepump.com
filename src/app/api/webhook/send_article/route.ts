import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Kept as a non-writing compatibility endpoint so old integrations cannot silently publish to /blog.
export async function POST() {
  return NextResponse.json({ code: 0, msg: "Blog automatic publishing is disabled. News automation publishes only to /news." }, { status: 410 });
}

export async function GET() {
  return NextResponse.json({ code: 0, msg: "Blog automatic publishing is disabled." }, { status: 410 });
}
