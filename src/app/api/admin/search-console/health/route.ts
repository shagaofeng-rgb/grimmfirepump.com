import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { checkSearchConsoleConnection, getSearchConsoleConfiguration } from "@/lib/search-console";
import { listSitemapRuns } from "@/lib/sitemap-service";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function GET(request: Request) {
  const admin = await getCurrentAdmin();
  if (!admin || admin.role !== "super_admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const checkRequested = new URL(request.url).searchParams.get("check") === "1";
  const configuration = getSearchConsoleConfiguration();
  const connection = checkRequested ? await checkSearchConsoleConnection() : null;
  const latestSitemapRun = (await listSitemapRuns())[0] || null;

  return NextResponse.json({
    configuration,
    connection,
    latestSitemapRun: latestSitemapRun
      ? {
          finishedAt: latestSitemapRun.finishedAt,
          status: latestSitemapRun.status,
          googleSubmissionWindow: latestSitemapRun.googleSubmissionWindow,
          searchConsole: latestSitemapRun.searchConsole,
        }
      : null,
    checkedAt: new Date().toISOString(),
  });
}
