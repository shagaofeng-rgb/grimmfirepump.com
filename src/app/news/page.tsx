import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { StickyCta } from "@/components/sticky-cta";
import { company } from "@/data/site";
import { localizedAlternates } from "@/lib/i18n";
import { listPublishedNews } from "@/lib/news-automation";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Fire Pump Industry News",
  description: "Recent public fire protection, NFPA20, fire pump, data center and industrial water system news with GRIMM engineering analysis.",
  alternates: localizedAlternates("/news"),
  openGraph: {
    title: "Fire Pump Industry News | GRIMM PUMP",
    description: "Recent fire pump and fire protection news linked to real GRIMM pump products and engineering guidance.",
    url: `${company.website}/news`,
  },
};

export default async function NewsPage() {
  const news = await listPublishedNews();

  return (
    <>
      <Header />
      <main className="bg-[var(--grey-50)]">
        <section className="bg-[var(--navy-950)] text-white">
          <div className="container-shell py-14 md:py-18">
            <p className="text-sm font-bold text-orange-200">Industry news</p>
            <h1 className="mt-3 max-w-4xl text-[38px] font-black leading-[1.08] md:text-[56px]">Fire pump industry news with product-level engineering context.</h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">
              Public industry updates are accepted only from configured trusted sources, then connected to real GRIMM products through an original buyer-focused engineering analysis. Historical URLs remain available but are not represented as current automated analysis.
            </p>
          </div>
        </section>

        <section className="container-shell py-12">
          {news.length ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {news.map((item) => (
                <article key={item.id} className="card overflow-hidden">
                  <Link href={`/news/${item.slug}`} className="block">
                    <span className="relative block aspect-[16/10] overflow-hidden bg-slate-100">
                      <img src={item.coverImageUrl} alt={item.coverImageAlt} className="h-full w-full object-cover" loading="lazy" />
                    </span>
                    <span className="block p-6">
                  <span className="text-xs font-black text-[var(--orange-dark)]">{item.category}</span>
                      <h2 className="mt-3 text-xl font-black leading-snug text-[var(--navy-950)]">{item.title}</h2>
                      <p className="mt-3 text-sm leading-6 text-slate-600">{item.summary}</p>
                      <span className="mt-5 flex flex-wrap gap-2 text-xs font-bold text-slate-500">
                        <span>{item.sourceName}</span>
                        <span>{(item.publishAt || item.sourcePublishedAt).slice(0, 10)}</span>
                      </span>
                    </span>
                  </Link>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8">
              <h2 className="text-2xl font-black text-[var(--navy-950)]">New industry updates are being prepared.</h2>
              <p className="mt-3 max-w-3xl leading-7 text-slate-600">
                Browse our existing company updates and technical articles, or contact the team for a project-specific discussion.
              </p>
              <Link className="button button-primary mt-6" href="/blog">Read existing company updates</Link>
            </div>
          )}
        </section>
      </main>
      <Footer />
      <StickyCta />
    </>
  );
}
