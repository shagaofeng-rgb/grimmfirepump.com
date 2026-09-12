import type { Metadata } from "next";
import { Header } from "@/components/header";
import { Hero } from "@/components/home/hero";
import { HomeTrustBar } from "@/components/home/home-trust-bar";
import { HomeCertificationSection } from "@/components/home/home-certification-section";
import { HomeFeaturedProducts } from "@/components/home/home-featured-products";
import { HomeFactoryCapability } from "@/components/home/home-factory-capability";
import { HomeGlobalCoverage } from "@/components/home/home-global-coverage";
import { ApplicationSection } from "@/components/home/application-section";
import { HomeFaq } from "@/components/home/home-faq";
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
      <Header />
      <main>
        <Hero />
        <HomeTrustBar />
        <HomeCertificationSection />
        <HomeFeaturedProducts />
        <HomeFactoryCapability />
        <HomeGlobalCoverage />
        <ApplicationSection featuredOnly />
        <HomeFaq />
        <HomeCta />
      </main>
      <HomeFooter />
    </div>
  );
}
