import type { Metadata } from "next";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { StickyCta } from "@/components/sticky-cta";
import { QuoteSection } from "@/components/home/quote-section";
import { localizedAlternates } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Contact GRIMM PUMP for Fire Pump Quotations",
  description: "Contact GRIMM PUMP by inquiry form, email or WhatsApp for fire pump selection, datasheets, catalog requests and project quotations.",
  alternates: localizedAlternates("/contact"),
};

export default function ContactPage() {
  return (
    <>
      <Header />
      <main>
        <h1 className="sr-only">Contact GRIMM PUMP for fire pump quotations</h1>
        <QuoteSection />
      </main>
      <Footer />
      <StickyCta />
    </>
  );
}
