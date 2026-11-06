import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Globe2, MapPin } from "lucide-react";
import { InteriorFrame, InteriorTabs, PageMast, SectionHeading } from "@/components/interior/frame";
import { MediaCard } from "@/components/interior/content";
import { ContentPagination, getPageNumber, getPageSlice } from "@/components/content-pagination";
import { catalogHref } from "@/lib/catalog-presentation";
import { projects } from "@/data/site";
import { localizedAlternates } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Global Fire Pump Project Cases",
  description: "Review GRIMM fire pump project cases by region, industry, product configuration and delivery evidence for overseas buyers.",
  alternates: localizedAlternates("/projects"),
};

export default async function ProjectsPage({ searchParams }: { searchParams: Promise<{ region?: string; page?: string }> }) {
  const { region, page } = await searchParams;
  const regions = [...new Set(projects.map((item) => item.region))];
  const active = regions.find((item) => item === region);
  const results = active ? projects.filter((item) => item.region === active) : projects;
  const paged = getPageSlice(results, getPageNumber(page), 4);
  return (
    <InteriorFrame path="/projects" breadcrumbs={[{ label: "Projects" }]}>
      <PageMast eyebrow="Project applications" title="Project applications by region" text="Fire-water equipment configurations for different installation conditions."
        action={<Link className="interior-button" href="/contact" prefetch={false}>Discuss a project <ArrowRight size={16} /></Link>} />
      <section className="interior-shell interior-band">
        <div className="interior-map">
          <Image src="/assets/images/footer-world-map.webp" alt="" fill sizes="(min-width: 701px) 720px, 100vw" />
          <p className="interior-kicker"><Globe2 size={15} /> Regional applications</p>
          <h2 className="interior-subtitle">Where these systems are considered</h2>
          <p className="mt-2 text-sm">Equipment references by region and application.</p>
        </div>
        <InteriorTabs label="Filter by region" links={[{ label: "All regions", href: "/projects", current: !active }, ...regions.map((item) => ({ label: item, href: catalogHref("/projects", { region: item }), current: item === active, icon: <MapPin size={15} /> }))]} />
        <div className="mt-6">
          <SectionHeading title={active || "Regional equipment references"} />
          <div className="interior-grid interior-grid-2">
            {paged.items.map((item) => (
              <MediaCard key={item.region} image={item.region === "South America" ? "/assets/synced/products/interior/edj-fire-pump-set.webp" : item.image}
                contain={item.region === "South America"} title={item.title} label={`${item.region} · Equipment reference`} text={item.text} />
            ))}
          </div>
        </div>
        <ContentPagination currentPage={paged.currentPage} totalItems={results.length} pageSize={4} pathname="/projects" searchParams={{ region: active }} />
      </section>
    </InteriorFrame>
  );
}
