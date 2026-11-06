import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, Building2, CalendarDays, FileText, Package, Search } from "lucide-react";
import { InteriorFrame, InteriorTabs, PageMast, SectionHeading } from "@/components/interior/frame";
import { ContentPagination, getPageNumber, getPageSlice } from "@/components/content-pagination";
import { applications, knowledgePosts } from "@/data/site";
import { boundedQuery, catalogHref } from "@/lib/catalog-presentation";
import { getPublicPosts, getPublicProducts } from "@/lib/public-cms";
import { listPublishedNews } from "@/lib/news-automation";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Search GRIMM PUMP",
  description: "Search GRIMM fire pump products, industry news, blog articles and fire protection knowledge.",
  robots: { index: false, follow: true },
};

const types = ["All", "Products", "Applications", "Guides", "Blog", "News"] as const;
const icons = { Products: Package, Applications: Building2, Guides: BookOpen, Blog: FileText, News: CalendarDays };
type SearchType = keyof typeof icons;
type SearchResult = { type: SearchType; title: string; text: string; href: string; match: string };

async function search(query: string): Promise<SearchResult[]> {
  const [products, posts, news] = await Promise.all([getPublicProducts(), getPublicPosts(), listPublishedNews()]);
  const results: SearchResult[] = [
    ...products.map((item): SearchResult => ({
      type: "Products", title: item.title, text: item.summary, href: `/products/${item.slug}`,
      match: [item.model, item.category, item.description, item.keywords].join(" "),
    })),
    ...applications.map((item): SearchResult => ({
      type: "Applications", title: `${item.title} Fire Protection`, text: item.text, href: `/applications/${item.slug}`, match: item.keyword,
    })),
    ...knowledgePosts.map((item): SearchResult => ({
      type: "Guides", title: item.title, text: item.text, href: `/knowledge/${item.slug}`, match: item.category,
    })),
    ...posts.map((item): SearchResult => ({
      type: "Blog", title: item.title, text: item.text, href: `/blog/${item.slug}`, match: `${item.category} ${item.content.join(" ")}`,
    })),
    ...news.map((item): SearchResult => ({
      type: "News", title: item.title, text: item.summary, href: `/news/${item.slug}`, match: `${item.category} ${item.body.join(" ")}`,
    })),
  ];
  const terms = [...new Set(query.toLowerCase().split(/[^\p{L}\p{N}]+/u).filter(Boolean))].slice(0, 12);
  if (!terms.length) return [];
  return results.map((item) => {
    const title = item.title.toLowerCase();
    const content = `${item.title} ${item.text} ${item.match}`.toLowerCase();
    return { ...item, rank: terms.every((term) => content.includes(term)) ? terms.filter((term) => title.includes(term)).length + 1 : 0 };
  }).filter((item) => item.rank > 0).sort((a, b) => b.rank - a.rank);
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string; type?: string; page?: string }> }) {
  const { q, type, page } = await searchParams;
  const query = boundedQuery(q);
  const selected = types.find((entry) => entry.toLowerCase() === boundedQuery(type).toLowerCase()) || "All";
  const matches = query ? await search(query) : [];
  const results = selected === "All" ? matches : matches.filter((item) => item.type === selected);
  const { items, currentPage } = getPageSlice(results, getPageNumber(page), 6);

  return (
    <InteriorFrame path="/search" breadcrumbs={[{ label: "Search" }]}>
      <PageMast eyebrow="GRIMM PUMP" title="Search" />
      <section className="interior-shell interior-band interior-search">
        <form className="interior-toolbar" action="/search" method="get" role="search">
          <label className="interior-field"><span className="sr-only">Search the site</span><input name="q" type="search" defaultValue={query} maxLength={120} placeholder="Search by model, application or guide" /></label>
          <button type="submit" className="interior-button interior-primary"><Search size={17} /> Search</button>
        </form>
        {query ? <>
          <InteriorTabs label="Search result type" links={types.map((entry) => ({ label: entry, href: catalogHref("/search", { q: query, type: entry === "All" ? undefined : entry }), current: selected === entry }))} />
          <div className="mt-5"><SectionHeading title={`Results for “${query}”`} action={<span className="interior-copy text-sm">{results.length} results</span>} /></div>
          {items.length > 0 ? items.map((item) => {
            const Icon = icons[item.type];
            return <article className="interior-result" key={item.href}>
              <Icon size={21} className="text-[var(--ip-accent)]" />
              <div><p className="interior-card-meta">{item.type}</p><h3 className="interior-card-title"><Link href={item.href} prefetch={false}>{item.title}</Link></h3><p className="interior-card-copy mt-1 line-clamp-2">{item.text}</p></div>
              <Link className="interior-icon-button" href={item.href} prefetch={false} aria-label={`Open ${item.title}`} title="Open result"><ArrowRight size={17} /></Link>
            </article>;
          }) : <div className="interior-empty"><h2>No matching results</h2><p>Try a product name, model or shorter term.</p><Link className="interior-button" href="/products" prefetch={false}>Browse products <ArrowRight size={16} /></Link></div>}
          <ContentPagination currentPage={currentPage} totalItems={results.length} pageSize={6} pathname="/search" searchParams={{ q: query, type: selected === "All" ? undefined : selected }} />
        </> : <div className="interior-actions"><Link className="interior-button" href="/products" prefetch={false}><Package size={17} /> Products</Link><Link className="interior-button" href="/knowledge" prefetch={false}><BookOpen size={17} /> Knowledge center</Link></div>}
      </section>
    </InteriorFrame>
  );
}
