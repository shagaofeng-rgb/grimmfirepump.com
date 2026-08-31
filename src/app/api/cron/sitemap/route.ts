import { NextResponse } from "next/server";
import { listSitemapRuns, runSitemapMaintenance } from "@/lib/sitemap-service";
import { getNextGoogleSubmissionAt, isGoogleSubmissionDue } from "@/lib/sitemap-submit-schedule";
import { revalidatePath, revalidateTag } from "next/cache";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function authorized(request: Request) {
  const secret = process.env.SITEMAP_CRON_SECRET || process.env.CRON_SECRET;
  if (!secret) return process.env.NODE_ENV !== "production";
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  if (!authorized(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const previousRuns = await listSitemapRuns();
  const submit = isGoogleSubmissionDue(previousRuns);
  const result = await runSitemapMaintenance({ trigger: "cron", submit });
  if (result.status === "success") {
    revalidateTag("sitemap-data");
    revalidatePath("/sitemap.xml");
    revalidatePath("/sitemaps/[file]", "page");
  }
  const latestRuns = result.googleSubmissionWindow ? [result, ...previousRuns] : previousRuns;
  return NextResponse.json({
    ...result,
    googleSubmissionDue: submit,
    nextGoogleSubmissionAt: getNextGoogleSubmissionAt(latestRuns),
  }, { status: result.status === "failed" ? 500 : 200 });
}

export async function POST(request: Request) {
  return GET(request);
}
