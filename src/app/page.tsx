import type { Metadata } from "next";
import { HomeHeader } from "@/components/home/home-header";
import { Hero } from "@/components/home/hero";
import { AdvantageSection } from "@/components/home/advantage-section";
import { ProjectPath } from "@/components/home/project-path";
import { ProductSection } from "@/components/home/product-section";
import { FactoryPreviewSection } from "@/components/home/factory-preview-section";
import { HomeCta } from "@/components/home/home-cta";
import { HomeFooter } from "@/components/home/home-footer";
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
    <div className="home-editorial">
      <HomeHeader />
      <main>
        <Hero />
        <AdvantageSection />
        <ProjectPath />
        <ProductSection featuredOnly />
        <FactoryPreviewSection />
        <HomeCta />
      </main>
      <HomeFooter />
    </div>
  );
}
