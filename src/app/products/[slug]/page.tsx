import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { StickyCta } from "@/components/sticky-cta";
import { products } from "@/data/site";

type ProductPageProps = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = products.find((item) => item.slug === slug);
  if (!product) return {};
  return {
    title: product.title,
    description: product.summary,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: { title: product.title, description: product.summary, images: [product.image] },
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = products.find((item) => item.slug === slug);
  if (!product) notFound();
  const ignoredTableLabels = new Set(["Pump", "Model", "Capacity(GPM)", "Head(BAR)", "Power(KW)", "Material"]);
  const detailLines = product.detailLines
    .filter((line) => !/^FQA:?$/i.test(line))
    .filter((line) => !ignoredTableLabels.has(line))
    .slice(0, 56);
  const faqLines = product.detailLines.filter((line) => /^(Q\d+:|A\d+:)/i.test(line)).slice(0, 12);
  const technicalLines = detailLines.filter((line) => line.includes(":")).slice(0, 18);
  const productDetailLines = detailLines.filter((line) => line.includes(":") || line.length > 28).slice(0, 24);

  return (
    <>
      <Header />
      <main>
        <section className="container-shell grid gap-12 py-16 lg:grid-cols-[0.95fr_1.05fr] lg:py-20">
          <div className="relative min-h-[320px] rounded-lg bg-slate-50 md:min-h-[420px]">
            <Image src={product.image} alt={product.title} fill priority className="object-contain p-8" />
          </div>
          <div>
            <p className="eyebrow mb-4">{product.category}</p>
            <h1 className="text-4xl font-black leading-tight text-[var(--navy-950)] md:text-5xl">{product.title}</h1>
            <p className="mt-6 text-lg leading-8 text-slate-600">{product.description}</p>
            <ul className="mt-8 flex flex-wrap gap-3">
              {product.specs.map((spec) => (
                <li key={spec} className="rounded-full bg-blue-50 px-4 py-2 text-sm font-bold text-[var(--navy-800)]">{spec}</li>
              ))}
            </ul>
            <div className="mt-8 grid gap-3 border-y border-slate-200 py-5 text-sm text-slate-600 sm:grid-cols-2">
              <span><strong className="text-[var(--navy-950)]">Release time:</strong> {product.releaseTime || "Available"}</span>
              <a className="font-bold text-[var(--navy-800)] underline decoration-[var(--orange)] underline-offset-4" href={product.sourceUrl} target="_blank" rel="noreferrer">
                View original website page
              </a>
            </div>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link className="button button-primary" href="/contact">Get Quote</Link>
              <Link className="button button-secondary" href="/downloads">Download Datasheet</Link>
            </div>
          </div>
        </section>
        <section className="section bg-[var(--grey-50)]">
          <div className="container-shell grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <article className="card p-7">
              <h2 className="text-2xl font-black text-[var(--navy-950)]">Technical Specifications</h2>
              <dl className="mt-6 grid gap-3">
                {(technicalLines.length ? technicalLines : product.specs).map((line) => {
                  const [label, ...value] = line.split(":");
                  return (
                    <div key={line} className="grid gap-1 border-b border-slate-100 pb-3 text-sm sm:grid-cols-[150px_1fr]">
                      <dt className="font-black text-[var(--navy-900)]">{value.length ? label : "Specification"}</dt>
                      <dd className="leading-6 text-slate-600">{value.length ? value.join(":").trim() : line}</dd>
                    </div>
                  );
                })}
              </dl>
            </article>
            <article className="card p-7">
              <h2 className="text-2xl font-black text-[var(--navy-950)]">Product Details</h2>
              <div className="mt-5 grid gap-3 text-sm leading-7 text-slate-600">
                {productDetailLines.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
            </article>
            <article className="card p-7 lg:col-span-2">
              <h2 className="text-2xl font-black text-[var(--navy-950)]">Buyer Notes & FAQ</h2>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {(faqLines.length ? faqLines : [
                  "Configured by flow, head, driver type and project application.",
                  "Available for fire protection, water supply, irrigation and sewage applications.",
                  "Contact sales with required flow, pressure, voltage, frequency and installation conditions.",
                  "Factory testing and export documentation can be prepared before delivery.",
                ]).map((line) => (
                  <p key={line} className="rounded-md bg-white p-4 text-sm leading-7 text-slate-600">{line}</p>
                ))}
              </div>
            </article>
          </div>
        </section>
      </main>
      <Footer />
      <StickyCta />
    </>
  );
}
