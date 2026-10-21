import type { Metadata } from "next";
import { DownloadsPageClient } from "@/components/downloads-page-client";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { StickyCta } from "@/components/sticky-cta";
import { localizedAlternates } from "@/lib/i18n";
import { listDownloadAssets } from "@/lib/admin-cms";

export const metadata: Metadata = {
  title: "Fire Pump Catalog and Technical Downloads",
  description: "Download currently available GRIMM PUMP fire pump documents. Ask our team for project-specific technical files and certificates.",
  alternates: localizedAlternates("/downloads"),
};

export default async function DownloadsPage() {
  const records = (await listDownloadAssets()).filter((item) => item.status === "published" && (item.fileUrl.startsWith("/") && !item.fileUrl.startsWith("//") || item.fileUrl.startsWith("https://")));
  const seen = new Set<string>();
  const assets = records.filter((item) => {
    if (seen.has(item.fileUrl)) return false;
    seen.add(item.fileUrl);
    return true;
  });
  return <><Header /><DownloadsPageClient assets={assets} /><Footer /><StickyCta /></>;
}
