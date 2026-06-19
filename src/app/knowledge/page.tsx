import { BlogSection } from "@/components/home/blog-section";
import { SimplePage } from "@/components/simple-page";

export default function KnowledgePage() {
  return (
    <SimplePage
      eyebrow="Knowledge Center"
      title="Fire pump knowledge, selection guides and industry updates."
      text="The knowledge center is designed as an SEO and buyer education hub, covering fire pump selection, NFPA20 related questions, testing, maintenance and industry applications."
    >
      <BlogSection />
    </SimplePage>
  );
}
