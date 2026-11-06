import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { EditorialFeature, EditorialRows } from "@/components/interior/editorial";
import { InteriorFrame, PageMast, SectionHeading } from "@/components/interior/frame";
import { localizedAlternates } from "@/lib/i18n";
import { getPublicPosts } from "@/lib/public-cms";
import { ContentPagination, getPageNumber, getPageSlice } from "@/components/content-pagination";

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
  const { currentPage, items } = getPageSlice(posts, getPageNumber(page), 6);
  const [featured, ...rest] = items.map((post) => ({ ...post, label: post.category, href: `/blog/${post.slug}` }));
  return (
    <InteriorFrame path="/blog" breadcrumbs={[{ label: "Blog" }]}>
      <PageMast eyebrow="Resources" title="Technical blog" text="Practical reading for pump system buyers and project teams." />
      <section className="interior-shell interior-band">
        {featured ? <>
          <SectionHeading title={currentPage === 1 ? "Latest articles" : "Technical articles"} />
          <EditorialFeature item={featured} linkText="Read article" />
          {rest.length > 0 && <div className="mt-5"><EditorialRows items={rest} images linkText="Read article" /></div>}
          <ContentPagination currentPage={currentPage} totalItems={posts.length} pageSize={6} pathname="/blog" />
        </> : <div className="interior-empty"><h2>No technical blog posts are published</h2><p>Engineering guides are available in the Knowledge Center.</p></div>}
        <div className="interior-related-link"><BookOpen size={20} /><Link href="/knowledge" prefetch={false} className="interior-text-link">Knowledge center <ArrowRight size={15} /></Link></div>
      </section>
    </InteriorFrame>
  );
}
