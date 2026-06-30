import type { Metadata } from "next";
import { DownloadsPageClient } from "@/components/downloads-page-client";

export const metadata: Metadata = {
  title: "Fire Pump Catalogs and Technical Downloads",
  description: "Request GRIMM fire pump catalogs, EDJ model tables, certificate packages, installation guides and project submittal documents.",
  alternates: { canonical: "/downloads" },
};

export default function DownloadsPage() {
  return <DownloadsPageClient />;
}
