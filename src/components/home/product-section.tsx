import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { SectionHeading } from "@/components/section-heading";
import { ContentPagination, getPageSlice } from "@/components/content-pagination";
import { productMegaMenuGroups } from "@/data/site";
import { getPublicProducts } from "@/lib/public-cms";
import { getProductFamily } from "@/lib/product-taxonomy";

type ProductSectionProps = {
  featuredOnly?: boolean;
  group?: string;
  page?: number;
};

const homepageSystems = [
  {
    title: "End Suction Fire Pumps",
    text: "Reliable, efficient and widely used for building and industrial applications.",
    image: "/assets/products/electric-fire-pump-clean.webp",
    href: "/products/electric-horizontal-split-end-suction-pump",
  },
  {
    title: "Vertical Turbine Fire Pumps",
    text: "Designed for deep well and large flow applications.",
    image: "/assets/products/vertical-turbine-fire-pump.webp",
    href: "/products/vertical-stainless-steel-multistage-pump-jockey-pump",
  },
  {
    title: "Fire Pump Packages",
    text: "Complete electric, diesel and jockey-pump configurations for reliable operation.",
    image: "/assets/products/edj-package.webp",
    href: "/products/edj-fire-pump-set",
  },
  {
    title: "Fire Pump Control Panels",
    text: "Diesel, electric and jockey pump controllers for reliable operation.",
    image: "/assets/factory/real/controller-assembly.webp",
    imageClassName: "object-cover",
    href: "/products",
  },
];

export async function ProductSection({ featuredOnly = false, group, page = 1 }: ProductSectionProps) {
  if (featuredOnly) {
    return (
      <section className="home-systems">
        <div className="home-section-inner">
          <div className="home-section-heading">
            <div><p>OUR PRODUCT SYSTEMS</p><h2>Our Product Systems</h2></div>
            <p>Complete fire pump solutions engineered for reliable performance in the most demanding applications.</p>
            <Link href="/products">View All Products <ArrowRight size={17} /></Link>
          </div>
          <div className="home-system-grid">
            {homepageSystems.map((item) => (
              <Link href={item.href} key={item.title} className="home-system-card">
                <figure>
                  <Image src={item.image} alt={item.title} fill className={item.imageClassName || "object-cover"} sizes="(min-width: 768px) 33vw, 38vw" />
                </figure>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                  <span>Learn More <ArrowRight size={15} /></span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    );
  }

  const products = await getPublicProducts();
  const activeGroup = productMegaMenuGroups.find((item) => item.slug === group);
  const groupedProducts = activeGroup
    ? products.filter((product) => getProductFamily(product.slug, product.title, product.category).id === activeGroup.slug)
    : products;
  const pagedProducts = getPageSlice(groupedProducts, page, 6);

  return (
    <section className="section bg-[var(--grey-50)]">
      <SectionHeading
        eyebrow="Product Center"
        title={activeGroup ? activeGroup.title + " for global project requirements." : "Pump systems arranged by real project application."}
        action={
          <Link className="font-black text-[var(--navy-800)] underline decoration-[var(--orange)] decoration-2 underline-offset-4" href="/tools/fire-pump-selector">
            Use Fire Pump Selector
          </Link>
        }
      />
      <div className="container-shell grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {pagedProducts.items.map((product) => (
          <article key={product.slug} className="product-card card card-interactive group relative flex min-h-[385px] flex-col overflow-hidden">
            <Link href={"/products/" + product.slug} className="absolute inset-0 z-10" aria-label={"View details for " + product.title} />
            <figure className="product-card-media relative grid h-[200px] place-items-center bg-[#f4f7f9] p-5">
              <Image src={product.image} alt={product.title} fill className="object-contain p-5 transition duration-300 group-hover:scale-[1.03]" sizes="(min-width: 1280px) 30vw, 50vw" />
            </figure>
            <div className="product-card-body flex flex-1 flex-col p-5">
              <p className="mb-2 text-xs font-black text-[var(--orange-dark)]">{product.category}</p>
              <h3 className="text-xl font-black text-[var(--navy-950)]">{product.title}</h3>
              <p className="mt-3 max-h-[4.5rem] overflow-hidden text-sm leading-6 text-slate-600">{product.summary}</p>
              <ul className="product-card-specs mt-auto flex flex-wrap gap-2 pt-5">
                {product.specs.slice(0, 3).map((spec) => (
                  <li key={spec} className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-[var(--navy-800)]">{spec}</li>
                ))}
              </ul>
              <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-black text-[var(--navy-800)]">View details <ArrowUpRight size={16} /></span>
            </div>
          </article>
        ))}
      </div>
      <div className="container-shell">
        <ContentPagination
          currentPage={pagedProducts.currentPage}
          totalItems={groupedProducts.length}
          pageSize={6}
          pathname="/products"
          searchParams={group ? { group } : {}}
        />
      </div>
    </section>
  );
}
