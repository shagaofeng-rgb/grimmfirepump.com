import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { runNewsAutomation } from "@/lib/news-automation";
import { revalidatePath, revalidateTag } from "next/cache";

export const dynamic = "force-dynamic";

export async function POST() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const result = await runNewsAutomation("admin");
  revalidateTag("cms-blog");
  revalidateTag("news-articles");
  revalidateTag("sitemap-data");
  revalidatePath("/news");
  revalidatePath("/blog");
  revalidatePath("/sitemap.xml");
  return NextResponse.json({ ok: result.ok, result }, { status: result.ok ? 200 : 500 });
}
