import { ProductSection } from "@/components/home/product-section";
import { SimplePage } from "@/components/simple-page";

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
