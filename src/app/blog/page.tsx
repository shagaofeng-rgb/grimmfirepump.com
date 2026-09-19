import type { Metadata } from "next";
import Link from "next/link";
import { BlogSection } from "@/components/home/blog-section";
import { SimplePage } from "@/components/simple-page";
import { localizedAlternates } from "@/lib/i18n";
import { getPublicPosts } from "@/lib/public-cms";
import { getPageNumber } from "@/components/content-pagination";

export const dynamic = "force-dynamic";

type BlogPageProps = { searchParams: Promise<{ page?: string }> };

export async function generateMetadata(): Promise<Metadata> {
  const posts = await getPublicPosts();
  return {
    title: "Fire Pump Technical Blog and Selection Guides",
    description: "Read original GRIMM technical guides for fire pump selection, engineering, installation, maintenance and project procurement.",
    alternates: localizedAlternates("/blog"),
    robots: posts.length ? { index: true, follow: true } : { index: false, follow: true },
  };
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const posts = await getPublicPosts();
  const { page } = await searchParams;
  if (!posts.length) {
    return (
      <SimplePage
        eyebrow="Technical Resources"
        title="Technical guidance is being refreshed."
        text="Use the Knowledge Center for current fire pump selection, installation and maintenance resources."
      >
        <div className="mt-8">
          <Link className="button button-primary" href="/knowledge">Browse Knowledge Center</Link>
        </div>
      </SimplePage>
    );
  }
  return (
    <SimplePage
      eyebrow="Technical Blog"
      title="Original fire pump engineering and procurement guidance."
      text="Practical articles for EPC contractors, fire protection engineers and project buyers covering selection, installation, maintenance and documentation."
    >
      <BlogSection items={posts} basePath="/blog" eyebrow="Technical Blog" title="Fire pump selection, engineering and maintenance guidance." page={getPageNumber(page)} paginationPath="/blog" />
    </SimplePage>
  );
}
