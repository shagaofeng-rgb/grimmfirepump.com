import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { StickyCta } from "@/components/sticky-cta";
import { getPublicPosts, getPublicProducts } from "@/lib/public-cms";
import { listPublishedNews } from "@/lib/news-automation";

type SearchPageProps = { searchParams: Promise<{ q?: string }> };

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Search GRIMM PUMP",
  description: "Search GRIMM fire pump products, industry news, blog articles and fire protection knowledge.",
  robots: { index: false, follow: true },
};

function score(text: string, query: string) {
  const haystack = text.toLowerCase();
  const terms = query.toLowerCase().split(/[^a-z0-9]+/).filter((term) => term.length > 1);
  return terms.reduce((sum, term) => sum + (haystack.includes(term) ? 1 : 0), 0);
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q = "" } = await searchParams;
  const query = q.trim();
  const [products, posts, news] = await Promise.all([getPublicProducts(), getPublicPosts(), listPublishedNews()]);
  const results = query
    ? [
        ...products.map((item) => ({
          type: "Product",
          title: item.title,
          summary: item.summary,
          href: `/products/${item.slug}`,
          text: `${item.title} ${item.category} ${item.summary} ${item.description} ${item.keywords}`,
        })),
        ...news.map((item) => ({
          type: "News",
          title: item.title,
          summary: item.summary,
          href: `/news/${item.slug}`,
          text: `${item.title} ${item.category} ${item.summary} ${item.body.join(" ")}`,
        })),
        ...posts.map((item) => ({
          type: "Blog",
          title: item.title,
          summary: item.text,
          href: `/blog/${item.slug}`,
          text: `${item.title} ${item.category} ${item.text} ${item.content.join(" ")}`,
        })),
      ]
        .map((item) => ({ ...item, score: score(item.text, query) }))
        .filter((item) => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 30)
    : [];

  return (
    <>
      <Header />
      <main className="container-shell py-14">
        <p className="eyebrow mb-4">Search</p>
        <h1 className="text-4xl font-black text-[var(--navy-950)]">Search products, news and engineering articles.</h1>
        <form className="mt-8 flex max-w-3xl gap-3" action="/search">
          <input name="q" defaultValue={query} className="min-h-12 flex-1 rounded-md border border-slate-300 px-4 text-base" placeholder="Search fire pump, EDJ, NFPA20..." />
          <button className="button button-primary" type="submit">Search</button>
        </form>
        <div className="mt-10 grid gap-4">
          {results.map((item) => (
            <Link key={`${item.type}-${item.href}`} href={item.href} className="rounded-lg border border-slate-200 bg-white p-5 hover:bg-slate-50">
              <span className="text-xs font-black uppercase tracking-[0.12em] text-[var(--orange)]">{item.type}</span>
              <strong className="mt-2 block text-xl text-[var(--navy-950)]">{item.title}</strong>
              <span className="mt-2 block leading-7 text-slate-600">{item.summary}</span>
            </Link>
          ))}
          {query && !results.length ? <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 font-bold text-slate-500">No matching product, news or blog result found.</div> : null}
        </div>
      </main>
      <Footer />
      <StickyCta />
    </>
  );
}
