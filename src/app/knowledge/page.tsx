import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, Building2, Gauge, LayoutGrid, Wrench } from "lucide-react";
import { FilterRail } from "@/components/interior/catalog";
import { EditorialRows } from "@/components/interior/editorial";
import { InteriorFrame, PageMast, SectionHeading } from "@/components/interior/frame";
import { knowledgePosts } from "@/data/site";
import { localizedAlternates } from "@/lib/i18n";
import { ContentPagination, getPageNumber, getPageSlice } from "@/components/content-pagination";
import { catalogHref } from "@/lib/catalog-presentation";

export const metadata: Metadata = {
  title: "Fire Pump Knowledge Center",
  description: "Practical fire pump guides for selection, NFPA-style project planning, maintenance, warehouse, data center and industrial applications.",
  alternates: localizedAlternates("/knowledge"),
};

type KnowledgePageProps = { searchParams: Promise<{ page?: string; topic?: string }> };

export default async function KnowledgePage({ searchParams }: KnowledgePageProps) {
  const { page, topic } = await searchParams;
  const topics = [...new Set(knowledgePosts.map((post) => post.category))];
  const active = topics.find((entry) => entry.toLowerCase() === (typeof topic === "string" ? topic.toLowerCase() : ""));
  const results = active ? knowledgePosts.filter((post) => post.category === active) : knowledgePosts;
  const { items, currentPage } = getPageSlice(results, getPageNumber(page), 6);
  return (
    <InteriorFrame path="/knowledge" breadcrumbs={[{ label: "Knowledge center" }]}>
      <PageMast eyebrow="Engineering resources" title="Knowledge center" text="Selection guides, project considerations and maintenance checklists."
        action={<Link className="interior-button" href="/tools/fire-pump-selector" prefetch={false}><Gauge size={16} /> Pump selector</Link>} />
      <section className="interior-shell interior-band interior-rail-layout">
        <FilterRail title="Topics" label={active || "All topics"}>
          <Link href="/knowledge" prefetch={false} aria-current={!active ? "page" : undefined}><LayoutGrid size={16} /> All topics</Link>
          {topics.map((item) => {
            const Icon = item === "Applications" ? Building2 : item === "Maintenance" ? Wrench : item === "Pump Selection" ? Gauge : BookOpen;
            return <Link key={item} href={catalogHref("/knowledge", { topic: item })} prefetch={false} aria-current={active === item ? "page" : undefined}><Icon size={16} />{item}</Link>;
          })}
        </FilterRail>
        <div>
          <SectionHeading title={active || "Technical guides"} action={<span className="interior-copy text-sm">{results.length} guides</span>} />
          <EditorialRows items={items.map((post) => ({ ...post, label: post.category, href: `/knowledge/${post.slug}` }))} images linkText="Read guide" />
          <ContentPagination currentPage={currentPage} totalItems={results.length} pageSize={6} pathname="/knowledge" searchParams={{ topic: active }} />
        </div>
      </section>
    </InteriorFrame>
  );
}
