import type { Metadata } from "next";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Hero } from "@/components/home/hero";
import { AdvantageSection } from "@/components/home/advantage-section";
import { ProductSection } from "@/components/home/product-section";
import { ApplicationSection } from "@/components/home/application-section";
import { FactoryPreviewSection } from "@/components/home/factory-preview-section";
import { QuoteSection } from "@/components/home/quote-section";
import { ComplianceSection } from "@/components/home/compliance-section";
import { StickyCta } from "@/components/sticky-cta";

export const metadata: Metadata = {
  title: "GRIMM PUMP | Fire Pump Systems for Global Projects",
  description:
    "Factory-built fire pump packages, diesel fire pumps, electric fire pumps and water system products for global project buyers.",
  alternates: { canonical: "/" },
};

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <AdvantageSection />
        <ComplianceSection />
        <ProductSection featuredOnly />
        <ApplicationSection featuredOnly />
        <FactoryPreviewSection />
        <QuoteSection />
      </main>
      <Footer />
      <StickyCta />
    </>
  );
}
