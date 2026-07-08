import type { Metadata } from "next";
import { ProductSection } from "@/components/home/product-section";
import { SimplePage } from "@/components/simple-page";
import { localizedAlternates } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Fire Pump Products and Water System Catalog",
  description: "Browse GRIMM fire pump packages, diesel fire pumps, electric fire pumps, jockey pumps, booster systems and sewage pump products.",
  alternates: localizedAlternates("/products"),
};

export const dynamic = "force-dynamic";

export default function ProductsPage() {
  return (
    <SimplePage
      eyebrow="Product Center"
      title="Official GRIMM product catalog for fire pump and water system projects."
      text="Synchronized from the current GRIMM website, including fire pump packages, diesel and electric fire pumps, jockey pumps, booster systems, sewage pumps and water supply equipment."
    >
      <ProductSection />
    </SimplePage>
  );
}
