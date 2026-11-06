import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Boxes, Droplets, Factory, Fan, Flame, Gauge, LayoutGrid, Package, Search, Settings2, SlidersHorizontal, Truck, Waves } from "lucide-react";
import type { ReactNode } from "react";
import type { PublicProduct } from "@/lib/public-cms";
import type { ProductNavigationGroup } from "@/lib/product-navigation";
import { catalogHref, keyParameters } from "@/lib/catalog-presentation";
import { interiorProductPhoto } from "@/lib/interior-product-images";
import { ContentPagination, getPageSlice } from "@/components/content-pagination";

const groupIcons = {
  "fire-pump-systems": Flame,
  "water-supply-systems": Droplets,
  "sewage-drainage-pumps": Waves,
  "integrated-pump-stations": Factory,
  "mobile-irrigation-solutions": Truck,
  "pumps-accessories": Settings2,
  pumps: Fan,
  accessories: Settings2,
};

export function FilterRail({ title, label, children }: { title: string; label?: string; children: ReactNode }) {
  return (
    <aside className="interior-rail">
      <div className="interior-rail-static">
        <p>{title}</p>
        <nav aria-label={title} className="interior-rail-nav">{children}</nav>
      </div>
      <details className="interior-filter-toggle">
        <summary><SlidersHorizontal size={16} />{label || title}<span aria-hidden="true">+</span></summary>
        <nav aria-label={title} className="interior-rail-nav">{children}</nav>
      </details>
    </aside>
  );
}

export function ProductCard({ product, compact = false }: { product: PublicProduct; compact?: boolean }) {
  const href = `/products/${product.slug}`;
  const specs = keyParameters(product.parameters, 2);
  return (
    <article className="interior-card interior-product-card">
      <Link href={href} prefetch={false} className="interior-image contain" aria-label={product.title}>
        <Image src={interiorProductPhoto(product.image)} alt="" fill sizes="(min-width: 1080px) 315px, (min-width: 701px) 38vw, 50vw" />
      </Link>
      <div className="interior-card-body">
        <p className="interior-card-meta">{product.category}</p>
        <h3 className="interior-card-title"><Link href={href} prefetch={false}>{product.title}</Link></h3>
        {!compact && specs.length > 0 && (
          <dl className="interior-card-specs">
            {specs.map(({ name, value, unit }) => <div key={name}><dt>{name}</dt><dd>{[value, unit].filter(Boolean).join(" ")}</dd></div>)}
          </dl>
        )}
        <Link className="interior-text-link" href={href} prefetch={false}>View product <ArrowRight size={15} /></Link>
      </div>
    </article>
  );
}

export function ProductCatalog({ products, groups, group, query, sort, page }: {
  products: PublicProduct[];
  groups: ProductNavigationGroup[];
  group: string;
  query: string;
  sort: string;
  page: number;
}) {
  const active = groups.find((item) => item.slug === group);
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  const results = products.filter((product) => {
    if (active && product.groupSlug !== active.slug) return false;
    const haystack = [product.title, product.model, product.category, product.summary, product.keywords].join(" ").toLowerCase();
    return terms.every((term) => haystack.includes(term));
  });
  if (sort === "name") results.sort((left, right) => left.title.localeCompare(right.title));
  if (sort === "newest") results.sort((left, right) => right.releaseTime.localeCompare(left.releaseTime));
  const pageSize = 6;
  const { currentPage, items } = getPageSlice(results, page, pageSize);
  const params = { group: active?.slug, q: query, sort };
  return (
    <section className="interior-shell interior-band interior-rail-layout">
      <FilterRail title="Product families" label={active?.title || "All products"}>
        <Link href={catalogHref("/products", { q: query, sort })} prefetch={false} aria-current={!active ? "page" : undefined}><LayoutGrid size={17} /> All products</Link>
        {groups.map((item) => {
          const Icon = groupIcons[item.slug as keyof typeof groupIcons] || Boxes;
          return <Link key={item.slug} href={catalogHref("/products", { ...params, group: item.slug })} prefetch={false} aria-current={active?.slug === item.slug ? "page" : undefined}><Icon size={17} />{item.title}</Link>;
        })}
        <Link href="/tools/fire-pump-selector" prefetch={false}><Gauge size={17} /> Pump selector</Link>
      </FilterRail>
      <div className="min-w-0">
        <form className="interior-toolbar" action="/products" method="get" role="search">
          {active && <input type="hidden" name="group" value={active.slug} />}
          <label className="interior-field"><span className="sr-only">Search the product catalog</span><input name="q" type="search" defaultValue={query} maxLength={120} placeholder="Search by product or model" /></label>
          <label className="interior-field interior-sort"><span className="sr-only">Sort products</span>
            <select name="sort" defaultValue={sort}><option value="">Catalog order</option><option value="name">Name A–Z</option><option value="newest">Newest first</option></select>
          </label>
          <button className="interior-icon-button" type="submit" aria-label="Apply catalog filters" title="Apply catalog filters"><Search size={18} /></button>
        </form>
        <div className="interior-section-heading">
          <h2>{active?.title || "All products"}</h2>
          <p className="interior-copy text-sm">{results.length} {results.length === 1 ? "product" : "products"}</p>
        </div>
        {items.length > 0 ? (
          <div className="interior-grid">{items.map((product) => <ProductCard product={product} key={product.slug} />)}</div>
        ) : (
          <div className="interior-empty"><Package size={23} /><h2>No products found</h2><p>{query ? "Try a different product name or model." : "There are no published products in this family."}</p><Link className="interior-button" href="/products">All products</Link></div>
        )}
        <ContentPagination currentPage={currentPage} totalItems={results.length} pageSize={pageSize} pathname="/products" searchParams={params} />
      </div>
    </section>
  );
}
