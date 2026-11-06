import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { ArticleReader } from "@/components/interior/editorial";
import { InteriorFrame } from "@/components/interior/frame";
import { knowledgePosts } from "@/data/site";

type KnowledgeDetailProps = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return knowledgePosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: KnowledgeDetailProps): Promise<Metadata> {
  const { slug } = await params;
  const post = knowledgePosts.find((item) => item.slug === slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.text,
    alternates: { canonical: `/knowledge/${post.slug}` },
    openGraph: { title: post.title, description: post.text, images: [post.image] },
  };
}

export default async function KnowledgeDetailPage({ params }: KnowledgeDetailProps) {
  const { slug } = await params;
  const post = knowledgePosts.find((item) => item.slug === slug);
  if (!post) notFound();

  return (
    <InteriorFrame path={`/knowledge/${post.slug}`} breadcrumbs={[{ label: "Knowledge center", href: "/knowledge" }, { label: post.title }]}>
      <ArticleReader title={post.title} label={post.category} date={post.date} text={post.text} image={post.image} content={post.content}
        back={{ label: "Back to knowledge center", href: "/knowledge" }}
        after={<section className="interior-source"><h2 className="interior-subtitle">Review a project duty point</h2><Link className="interior-button interior-primary mt-3" href="/tools/fire-pump-selector" prefetch={false}>Pump selector <ArrowRight size={16} /></Link></section>}
      />
    </InteriorFrame>
  );
}
