import type { Metadata } from "next";
import { BlogSection } from "@/components/home/blog-section";
import { SimplePage } from "@/components/simple-page";
import { knowledgePosts } from "@/data/site";
import { localizedAlternates } from "@/lib/i18n";
import { getPageNumber } from "@/components/content-pagination";

export const metadata: Metadata = {
  title: "Fire Pump Knowledge Center",
  description: "Practical fire pump guides for selection, NFPA-style project planning, maintenance, warehouse, data center and industrial applications.",
  alternates: localizedAlternates("/knowledge"),
};

type KnowledgePageProps = { searchParams: Promise<{ page?: string }> };

export default async function KnowledgePage({ searchParams }: KnowledgePageProps) {
  const { page } = await searchParams;
  return (
    <SimplePage
      eyebrow="Knowledge Center"
      title="Fire pump knowledge, selection guides and industry updates."
      text="Practical buyer education for fire pump selection, project applications, testing, maintenance and pump room planning."
    >
      <BlogSection
        items={knowledgePosts}
        basePath="/knowledge"
        eyebrow="Knowledge Center"
        title="Complete fire pump guides with relevant project images."
        page={getPageNumber(page)}
        paginationPath="/knowledge"
      />
    </SimplePage>
  );
}
