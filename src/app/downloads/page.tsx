import type { Metadata } from "next";
import { DownloadsPageClient } from "@/components/downloads-page-client";
import { localizedAlternates } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Fire Pump Catalogs and Technical Downloads",
  description: "Request GRIMM fire pump catalogs, EDJ model tables, certificate packages, installation guides and project submittal documents.",
  alternates: localizedAlternates("/downloads"),
};

export default function DownloadsPage() {
  return <DownloadsPageClient />;
}
