import { BlogSection } from "@/components/home/blog-section";
import { SimplePage } from "@/components/simple-page";
import { knowledgePosts } from "@/data/site";

export default function KnowledgePage() {
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
      />
    </SimplePage>
  );
}
