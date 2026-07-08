import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { runNewsAutomation } from "@/lib/news-automation";

export const dynamic = "force-dynamic";

export async function POST() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const result = await runNewsAutomation("admin");
  return NextResponse.json({ ok: result.ok, result }, { status: result.ok ? 200 : 500 });
}
