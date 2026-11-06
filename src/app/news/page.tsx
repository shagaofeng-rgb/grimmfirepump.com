import type { Metadata } from "next";
import { EditorialFeature, EditorialRows } from "@/components/interior/editorial";
import { InteriorFrame, PageMast, SectionHeading } from "@/components/interior/frame";
import { company } from "@/data/site";
import { localizedAlternates } from "@/lib/i18n";
import { listPublishedNews } from "@/lib/news-automation";
import { ContentPagination, getPageNumber, getPageSlice } from "@/components/content-pagination";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Fire Pump Industry News",
  description: "Independent editorial summaries of verified fire protection, data center and industrial fire-water industry updates.",
  alternates: localizedAlternates("/news"),
  openGraph: {
    title: "Fire Pump Industry News | GRIMM PUMP",
    description: "Verified industry updates with source attribution and independent editorial analysis.",
    url: `${company.website}/news`,
  },
};

type NewsPageProps = { searchParams: Promise<{ page?: string }> };

export default async function NewsPage({ searchParams }: NewsPageProps) {
  const news = await listPublishedNews();
  const { page } = await searchParams;
  const pageSize = 4;
  const pagedNews = getPageSlice(news, getPageNumber(page), pageSize);
  const [featured, ...rest] = pagedNews.items.map((item) => ({
    href: `/news/${item.slug}`, title: item.title, image: item.coverImageUrl, text: item.summary,
    label: item.sourceName, date: (item.publishAt || item.sourcePublishedAt).slice(0, 10),
  }));

  return (
    <InteriorFrame path="/news" breadcrumbs={[{ label: "News" }]}>
      <PageMast eyebrow="Resources" title="Industry news" text="External industry updates with original sources and publication dates." />
      <section className="interior-shell interior-band">
        {featured ? (
          <div className="interior-split">
            <div><h2 className="sr-only">Featured update</h2><div className="interior-news-feature"><EditorialFeature item={featured} linkText="Read update" /></div></div>
            {rest.length > 0 && <div><SectionHeading title="Industry updates" /><EditorialRows items={rest} linkText="Read update" /></div>}
          </div>
        ) : <div className="interior-empty"><h2>No industry updates are published</h2></div>}
        <ContentPagination currentPage={pagedNews.currentPage} totalItems={news.length} pageSize={pageSize} pathname="/news" />
      </section>
    </InteriorFrame>
  );
}
