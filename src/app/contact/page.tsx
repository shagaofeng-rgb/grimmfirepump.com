import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { StickyCta } from "@/components/sticky-cta";
import { QuoteSection } from "@/components/home/quote-section";

export default function ContactPage() {
  return (
    <>
      <Header />
      <main>
        <QuoteSection />
      </main>
      <Footer />
      <StickyCta />
    </>
  );
}
