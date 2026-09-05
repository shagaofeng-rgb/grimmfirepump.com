import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { SectionHeading } from "@/components/section-heading";
import { productMegaMenuGroups } from "@/data/site";
import { getPublicProducts } from "@/lib/public-cms";
import { getProductFamily } from "@/lib/product-taxonomy";

type ProductSectionProps = {
  featuredOnly?: boolean;
  group?: string;
};

const homeProductOrder = [
  "edj-fire-pump-set",
  "diesel-engine-fire-pump",
  "2-electric-plus-jockey-pump-set",
  "vertical-stainless-steel-multistage-pump-jockey-pump",
];

const homeProductCopy: Record<string, { label: string; text: string }> = {
  "edj-fire-pump-set": {
    label: "EDJ fire pump systems",
    text: "Electric, diesel and jockey pump arrangement for project package discussions.",
  },
  "diesel-engine-fire-pump": {
    label: "Diesel fire pump sets",
    text: "Diesel-driven fire pump options reviewed against site and duty requirements.",
  },
  "2-electric-plus-jockey-pump-set": {
    label: "Electric fire pump systems",
    text: "Electric main-pump combinations coordinated with pressure-maintenance needs.",
  },
  "vertical-stainless-steel-multistage-pump-jockey-pump": {
    label: "Jockey pump configurations",
    text: "Pressure-maintenance pump options for a complete fire-water system brief.",
  },
};

export async function ProductSection({ featuredOnly = false, group }: ProductSectionProps) {
  const products = await getPublicProducts();
  const activeGroup = productMegaMenuGroups.find((item) => item.slug === group);
  const groupedProducts = activeGroup
    ? products.filter((product) => getProductFamily(product.slug, product.title, product.category).id === activeGroup.slug)
    : products;

  if (featuredOnly) {
    const visibleProducts = homeProductOrder
      .map((slug) => groupedProducts.find((product) => product.slug === slug))
      .filter((product): product is NonNullable<typeof product> => Boolean(product));

    return (
      <section className="home-systems-section">
        <div className="container-shell py-20 md:py-24">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl">
              <p className="home-kicker">Core fire pump systems</p>
              <h2 className="home-display mt-3 text-3xl leading-tight text-white md:text-[48px]">
                Explore systems by project condition.
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300">
                Begin with the required arrangement, then confirm the duty point, drive and project documentation.
              </p>
            </div>
            <Link href="/products" className="home-text-link">
              View all products
              <ArrowRight size={18} />
            </Link>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-2">
            {visibleProducts.map((product) => {
              const content = homeProductCopy[product.slug];
              return (
                <article key={product.slug} className="home-system-card group">
                  <Link href={"/products/" + product.slug} className="absolute inset-0 z-10" aria-label={"View " + content.label} />
                  <figure className="relative min-h-[230px] overflow-hidden bg-[#f3f1eb] sm:min-h-[280px]">
                    <Image
                      src={product.image}
                      alt={product.title}
                      fill
                      className="object-contain p-7 transition duration-500 group-hover:scale-[1.035]"
                      sizes="(min-width: 768px) 50vw, 100vw"
                    />
                  </figure>
                  <div className="flex items-start justify-between gap-5 border-t border-white/10 p-6">
                    <div>
                      <h3 className="text-xl font-black text-white">{content.label}</h3>
                      <p className="mt-3 max-w-lg text-sm leading-6 text-slate-400">{content.text}</p>
                    </div>
                    <ArrowUpRight className="mt-1 shrink-0 text-[var(--orange)]" size={22} />
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    );
  }

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
        {groupedProducts.map((product) => (
          <article key={product.slug} className="product-card card card-interactive group relative flex min-h-[405px] flex-col overflow-hidden">
            <Link href={"/products/" + product.slug} className="absolute inset-0 z-10" aria-label={"View details for " + product.title} />
            <figure className="product-card-media relative grid h-[200px] place-items-center bg-[#f4f7f9] p-5">
              <Image src={product.image} alt={product.title} fill className="object-contain p-5 transition duration-300 group-hover:scale-[1.03]" sizes="(min-width: 1280px) 30vw, 50vw" />
            </figure>
            <div className="product-card-body flex flex-1 flex-col p-5">
              <p className="mb-2 text-xs font-black text-[var(--orange-dark)]">{product.category}</p>
              <h3 className="text-xl font-black text-[var(--navy-950)]">{product.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{product.summary}</p>
              <ul className="product-card-specs mt-auto flex flex-wrap gap-2 pt-5">
                {product.specs.map((spec) => (
                  <li key={spec} className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-[var(--navy-800)]">{spec}</li>
                ))}
              </ul>
              <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-black text-[var(--navy-800)]">View details <ArrowUpRight size={16} /></span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
