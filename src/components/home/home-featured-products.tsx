import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, CheckCircle2 } from "lucide-react";

const products = [
  {
    title: "EDJ Fire Pump System",
    image: "/assets/synced/products/edj-fire-pump-set.jpg",
    href: "/products/edj-fire-pump-set",
    text: "Electric, diesel and jockey pump combinations prepared around the required project duty.",
    points: ["Duty-point configuration", "Package documentation", "Engineering review"],
  },
  {
    title: "Diesel Fire Pump",
    image: "/assets/synced/products/diesel-engine-fire-pump.png",
    href: "/products/diesel-engine-fire-pump",
    text: "Independent diesel-driven fire pump options for projects requiring a dedicated driver package.",
    points: ["Diesel driver options", "Pump and controller scope", "Project submittal support"],
  },
  {
    title: "Jockey Pump Configuration",
    image: "/assets/synced/products/vertical-stainless-steel-multistage-pump-jockey-pump.png",
    href: "/products/vertical-stainless-steel-multistage-pump-jockey-pump",
    text: "Pressure-maintenance pump configurations for integrated fire protection systems.",
    points: ["Compact vertical design", "Pressure maintenance", "System coordination"],
  },
];

export function HomeFeaturedProducts() {
  return (
    <section className="bg-white py-14 md:py-20">
      <div className="mx-auto max-w-[1240px] px-5 md:px-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-black text-[var(--orange-dark)]">FEATURED SYSTEMS</p>
            <h2 className="mt-3 text-3xl font-black leading-tight text-[var(--navy-950)] md:text-5xl">Start with the system family that fits the project.</h2>
          </div>
          <Link href="/products" className="text-sm font-black text-[var(--navy-900)] underline decoration-[var(--orange)] decoration-2 underline-offset-4">Explore all products</Link>
        </div>
        <div className="mt-9 grid gap-5 lg:grid-cols-3">
          {products.map((product) => (
            <article key={product.title} className="flex min-h-[480px] flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
              <div className="relative h-52 bg-slate-50">
                <Image src={product.image} alt={product.title} fill className="object-contain p-6" sizes="(min-width: 1024px) 33vw, 92vw" />
              </div>
              <div className="flex flex-1 flex-col p-6">
                <h3 className="text-xl font-black text-[var(--navy-950)]">{product.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{product.text}</p>
                <ul className="mt-5 grid gap-2 text-sm font-bold text-slate-700">
                  {product.points.map((point) => <li key={point} className="flex gap-2"><CheckCircle2 className="mt-0.5 shrink-0 text-[var(--orange)]" size={16} />{point}</li>)}
                </ul>
                <Link href={product.href} className="mt-auto inline-flex items-center gap-2 pt-7 text-sm font-black text-[var(--navy-900)]">
                  View product details <ArrowUpRight size={17} />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
