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

const homepageSystems = [
  {
    title: "EDJ fire pump systems",
    image: "/assets/applications/hero-edj.webp",
    href: "/products/edj-fire-pump-set",
  },
  {
    title: "Diesel fire pump sets",
    image: "/assets/applications/diesel-site.webp",
    href: "/products/diesel-engine-fire-pump",
  },
  {
    title: "Jockey pump configurations",
    image: "/assets/applications/jockey-room.webp",
    href: "/products/vertical-stainless-steel-multistage-pump-jockey-pump",
  },
];

export async function ProductSection({ featuredOnly = false, group }: ProductSectionProps) {
  if (featuredOnly) {
    return (
      <section className="home-systems">
        <div className="home-section-inner">
          <h2>Explore systems by project condition</h2>
          <div className="home-system-grid">
            {homepageSystems.map((item) => (
              <Link href={item.href} key={item.title} className="home-system-card">
                <figure>
                  <Image src={item.image} alt={item.title} fill className="object-cover" sizes="(min-width: 768px) 33vw, 38vw" />
                </figure>
                <div>
                  <h3>{item.title}</h3>
                  <ArrowRight size={21} />
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
