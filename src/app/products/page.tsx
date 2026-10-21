import type { Metadata } from "next";
import { ProductSection } from "@/components/home/product-section";
import { SimplePage } from "@/components/simple-page";
import { localizedAlternates } from "@/lib/i18n";
import { getPageNumber } from "@/components/content-pagination";
import { getPublicProductNavigation } from "@/lib/public-cms";

export async function generateMetadata({ searchParams }: ProductsPageProps): Promise<Metadata> {
  const { group } = await searchParams;
  const activeGroup = group ? (await getPublicProductNavigation()).find((item) => item.slug === group) : undefined;
  return {
    title: activeGroup ? `${activeGroup.title} | GRIMM PUMP Products` : "Fire Pump Products and Water System Catalog",
    description: activeGroup?.description || "Browse GRIMM fire pump packages, diesel fire pumps, electric fire pumps, jockey pumps, booster systems and sewage pump products.",
    alternates: localizedAlternates("/products"),
    ...(activeGroup && !activeGroup.items.length ? { robots: { index: false, follow: true } } : {}),
  };
}

export const dynamic = "force-dynamic";

type ProductsPageProps = {
  searchParams: Promise<{ group?: string; page?: string }>;
};

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const { group, page } = await searchParams;
  return (
    <SimplePage
      eyebrow="Product Center"
      title="Official GRIMM product catalog for fire pump and water system projects."
      text="Synchronized from the current GRIMM website, including fire pump packages, diesel and electric fire pumps, jockey pumps, booster systems, sewage pumps and water supply equipment."
    >
      <ProductSection group={group} page={getPageNumber(page)} />
    </SimplePage>
  );
}
