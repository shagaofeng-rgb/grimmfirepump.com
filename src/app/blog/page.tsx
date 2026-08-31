import type { Metadata } from "next";
import { BlogSection } from "@/components/home/blog-section";
import { SimplePage } from "@/components/simple-page";
import { localizedAlternates } from "@/lib/i18n";
import { getPublicPosts } from "@/lib/public-cms";

export const metadata: Metadata = {
  title: "Fire Pump Technical Blog and Selection Guides",
  description: "Read original GRIMM technical guides for fire pump selection, engineering, installation, maintenance and project procurement.",
  alternates: localizedAlternates("/blog"),
};

export const dynamic = "force-dynamic";

export default async function BlogPage() {
  const posts = await getPublicPosts();
  return (
    <SimplePage
      eyebrow="Technical Blog"
      title="Original fire pump engineering and procurement guidance."
      text="Practical articles for EPC contractors, fire protection engineers and project buyers covering selection, installation, maintenance and documentation."
    >
      <BlogSection items={posts} basePath="/blog" eyebrow="Technical Blog" title="Fire pump selection, engineering and maintenance guidance." />
    </SimplePage>
  );
}
