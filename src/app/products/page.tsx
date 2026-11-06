import type { Metadata } from "next";
import Link from "next/link";
import { Gauge } from "lucide-react";
import { ProductCatalog } from "@/components/interior/catalog";
import { InteriorFrame, PageMast } from "@/components/interior/frame";
import { localizedAlternates } from "@/lib/i18n";
import { getPageNumber } from "@/components/content-pagination";
import { getPublicProductNavigation, getPublicProducts } from "@/lib/public-cms";
import { boundedQuery } from "@/lib/catalog-presentation";

export async function generateMetadata({ searchParams }: ProductsPageProps): Promise<Metadata> {
  const { group, q, sort } = await searchParams;
  const activeGroup = group ? (await getPublicProductNavigation()).find((item) => item.slug === group) : undefined;
  return {
    title: activeGroup ? `${activeGroup.title} | GRIMM PUMP Products` : "Fire Pump Products and Water System Catalog",
    description: activeGroup?.description || "Browse GRIMM fire pump packages, diesel fire pumps, electric fire pumps, jockey pumps, booster systems and sewage pump products.",
    alternates: localizedAlternates("/products"),
    ...(q || sort || (activeGroup && !activeGroup.items.length) ? { robots: { index: false, follow: true } } : {}),
  };
}

export const dynamic = "force-dynamic";

type ProductsPageProps = {
  searchParams: Promise<{ group?: string; page?: string; q?: string; sort?: string }>;
};

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const { group, page, q, sort } = await searchParams;
  const [products, groups] = await Promise.all([getPublicProducts(), getPublicProductNavigation()]);
  return (
    <InteriorFrame path="/products" breadcrumbs={[{ label: "Products" }]}>
      <PageMast
        eyebrow="Product families"
        title="Fire pumps & water systems"
        text="Find fire pump packages, water supply equipment and pumps by product family."
        action={<Link href="/tools/fire-pump-selector" className="interior-button" prefetch={false}><Gauge size={16} /> Pump selector</Link>}
      />
      <ProductCatalog products={products} groups={groups} group={boundedQuery(group)} query={boundedQuery(q)} sort={sort === "name" || sort === "newest" ? sort : ""} page={getPageNumber(page)} />
    </InteriorFrame>
  );
}
