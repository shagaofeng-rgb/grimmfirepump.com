import Image from "next/image";
import Link from "next/link";
import { SectionHeading } from "@/components/section-heading";
import { getPublicProducts } from "@/lib/public-cms";

type ProductSectionProps = {
  featuredOnly?: boolean;
};

export async function ProductSection({ featuredOnly = false }: ProductSectionProps) {
  const products = await getPublicProducts();
  const visibleProducts = featuredOnly ? products.slice(0, 3) : products;

  return (
    <section className="section bg-[var(--grey-50)]">
      <SectionHeading
        eyebrow="Product Center"
        title="Fire pump products arranged by overseas buying intent."
        action={
          <Link className="font-black text-[var(--navy-800)] underline decoration-[var(--orange)] decoration-2 underline-offset-4" href="/tools/fire-pump-selector">
            Use Fire Pump Selector
          </Link>
        }
      />
      <div className="container-shell grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {visibleProducts.map((product) => (
          <article
            key={product.slug}
            className="product-card card group relative flex min-h-[430px] flex-col overflow-hidden transition hover:-translate-y-1 hover:shadow-xl"
          >
            <Link
              href={`/products/${product.slug}`}
              className="absolute inset-0 z-10"
              aria-label={`View details for ${product.title}`}
            />
            <figure className="product-card-media relative grid h-[205px] place-items-center bg-gradient-to-b from-white to-slate-100 p-5">
              <Image
                src={product.image}
                alt={product.title}
                fill
                className="object-contain p-5 transition duration-300 group-hover:scale-[1.03]"
                sizes="(min-width: 1280px) 30vw, 50vw"
              />
            </figure>
            <div className="product-card-body flex flex-1 flex-col p-5">
              <p className="mb-2 text-xs font-black uppercase tracking-[0.12em] text-[var(--orange)]">{product.category}</p>
              <h3 className="text-xl font-black text-[var(--navy-950)]">{product.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{product.summary}</p>
              <ul className="product-card-specs mt-auto flex flex-wrap gap-2 pt-5">
                {product.specs.map((spec) => (
                  <li key={spec} className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-[var(--navy-800)]">
                    {spec}
                  </li>
                ))}
              </ul>
              <span className="button button-secondary mt-5 min-h-11">
                View Details
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
