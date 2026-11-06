import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowRight, ExternalLink } from "lucide-react";
import { ArticleReader } from "@/components/interior/editorial";
import { InteriorFrame } from "@/components/interior/frame";
import { company } from "@/data/site";
import { getPublicPost } from "@/lib/public-cms";
import { safeArticleImageUrl } from "@/lib/article-content";

type BlogDetailProps = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: BlogDetailProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublicPost(slug);
  if (!post) return {};
  const title = post.seoTitle || post.title;
  const description = post.seoDescription || post.text;
  return {
    title,
    description,
    alternates: { canonical: post.canonicalUrl || `/blog/${post.slug}` },
    robots: post.indexable ? { index: true, follow: true } : { index: false, follow: true },
    openGraph: { type: "article", title, description, url: post.canonicalUrl, images: [post.image], publishedTime: post.publishedAt, modifiedTime: post.updatedAt },
    twitter: { card: "summary_large_image", title, description, images: [post.image] },
  };
}

export default async function BlogDetailPage({ params }: BlogDetailProps) {
  const { slug } = await params;
  const post = await getPublicPost(slug);
  if (!post) notFound();
  const url = `${company.website}/blog/${post.slug}`;
  const source = safeArticleImageUrl(post.sourceUrl);
  const imageUrl = post.image.startsWith("http") ? post.image : `${company.website}${post.image}`;
  const blogSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.text,
    image: [imageUrl],
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    ...(post.author === company.shortName ? { author: { "@type": "Organization", name: company.shortName, url: company.website } } : {}),
    publisher: {
      "@type": "Organization",
      name: company.shortName,
      logo: { "@type": "ImageObject", url: `${company.website}/assets/images/logo.png` },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
  };

  return (
    <InteriorFrame path={`/blog/${post.slug}`} breadcrumbs={[{ label: "Blog", href: "/blog" }, { label: post.title }]}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema).replace(/</g, "\\u003c") }} />
      <ArticleReader title={post.title} label={post.category} date={post.date} text={post.text} image={post.image} content={post.content}
        back={{ label: "Back to technical blog", href: "/blog" }}
        source={source && <a className="interior-text-link mt-4" href={source} target="_blank" rel="noreferrer">Original website page <ExternalLink size={15} /></a>}
        after={<section className="interior-source"><h2 className="interior-subtitle">Discuss your project duty point</h2><Link className="interior-button interior-primary mt-3" href="/contact" prefetch={false}>Ask an engineer <ArrowRight size={16} /></Link></section>}
      />
    </InteriorFrame>
  );
}
