import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, Download, FileText } from "lucide-react";
import { DownloadRequest } from "@/components/downloads-page-client";
import { FilterRail } from "@/components/interior/catalog";
import { InteriorFrame, PageMast, SectionHeading } from "@/components/interior/frame";
import { ContentPagination, getPageNumber, getPageSlice } from "@/components/content-pagination";
import { localizedAlternates } from "@/lib/i18n";
import { listDownloadAssets } from "@/lib/admin-cms";

export const metadata: Metadata = {
  title: "Fire Pump Catalog and Technical Downloads",
  description: "Download currently available GRIMM PUMP fire pump documents. Ask our team for project-specific technical files and certificates.",
  alternates: localizedAlternates("/downloads"),
};

export default async function DownloadsPage({ searchParams }: { searchParams: Promise<{ type?: string; page?: string }> }) {
  const { type, page } = await searchParams;
  const category = type === "project" ? "project" : "catalog";
  const records = (await listDownloadAssets()).filter((item) => item.status === "published" && (item.fileUrl.startsWith("/") && !item.fileUrl.startsWith("//") || item.fileUrl.startsWith("https://")));
  const seen = new Set<string>();
  const assets = records.filter((item) => {
    if (seen.has(item.fileUrl)) return false;
    seen.add(item.fileUrl);
    return true;
  });
  const results = assets.filter((item) => /catalog/i.test(item.category) === (category === "catalog"));
  const { items, currentPage } = getPageSlice(results, getPageNumber(page), 6);
  return (
    <InteriorFrame path="/downloads" breadcrumbs={[{ label: "Downloads" }]}>
      <PageMast eyebrow="Resources" title="Download center" text="Product catalogs and project documentation." />
      <section className="interior-shell interior-band interior-rail-layout">
        <FilterRail title="Document type" label={category === "catalog" ? "Product catalogs" : "Project documentation"}>
          <Link href="/downloads" prefetch={false} aria-current={category === "catalog" ? "page" : undefined}><BookOpen size={17} /> Product catalogs</Link>
          <Link href="/downloads?type=project" prefetch={false} aria-current={category === "project" ? "page" : undefined}><FileText size={17} /> Project documentation</Link>
        </FilterRail>
        <div>
          <SectionHeading title={category === "catalog" ? "Product catalogs" : "Project documentation"} />
          {items.length > 0 ? <div className="grid gap-3">
            {items.map((item) => (
              <article key={item.id} className={category === "catalog" ? "interior-card interior-editorial-feature" : "interior-document-row"}>
                {category === "catalog" ? <div className="interior-image">
                  <Image src="/assets/applications/hero-edj.webp" alt="GRIMM EDJ pump package" fill sizes="(min-width: 1080px) 510px, (min-width: 701px) 42vw, 100vw" />
                </div> : <FileText size={24} className="text-[var(--ip-accent)]" />}
                <div className={category === "catalog" ? "interior-card-body" : "interior-document-copy"}>
                  <p className="interior-card-meta">{item.category}</p>
                  <h3 className="interior-card-title">{item.title}</h3>
                  <p className="interior-card-copy">{[item.language, item.version].filter(Boolean).join(" · ")}</p>
                  <div className="interior-actions mt-2">
                    {item.gated ? <DownloadRequest id={item.id} title={item.title} />
                      : <a className="interior-button interior-primary" href={item.fileUrl} target="_blank" rel="noopener noreferrer" data-event="download_click"><Download size={16} /> Open document</a>}
                  </div>
                </div>
              </article>
            ))}
          </div> : <p className="interior-copy">No documents are published in this category.</p>}
          <ContentPagination currentPage={currentPage} totalItems={results.length} pageSize={6} pathname="/downloads" searchParams={{ type: category === "project" ? "project" : undefined }} />
          {category === "project" && (
            <div className="mt-6 grid gap-3">
              <Link className="interior-text-link" href="/certificates" prefetch={false}>Certificates & attestations <ArrowRight size={16} /></Link>
              <Link className="interior-text-link" href="/contact" prefetch={false}>Request model-specific files <ArrowRight size={16} /></Link>
            </div>
          )}
        </div>
      </section>
    </InteriorFrame>
  );
}
