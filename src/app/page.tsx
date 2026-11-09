import type { Metadata } from "next";
import { FactoryHome } from "@/components/home/factory-home";
import { HomeFooter } from "@/components/home/home-footer";
import { StickyCta } from "@/components/sticky-cta";
import { localizedAlternates } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "GRIMM PUMP | Fire Pump Systems for Global Projects",
  description:
    "Review GRIMM fire pump systems by duty point, drive, water source and project documentation requirements.",
  alternates: localizedAlternates("/"),
};

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <div className="home-editorial home-factory-reference">
      <FactoryHome />
      <HomeFooter />
      <StickyCta />
    </div>
  );
}
