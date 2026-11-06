import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArticleReader } from "@/components/interior/editorial";
import { InteriorFrame } from "@/components/interior/frame";
import { localizedSite } from "@/data/localized-site";
import { isLocalizedLocale, localizedAlternates, localizedPath } from "@/lib/i18n";
import { getPublicPost } from "@/lib/public-cms";

type LocalizedBlogDetailProps = { params: Promise<{ locale: string; slug: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: LocalizedBlogDetailProps): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocalizedLocale(locale)) return {};
  const post = await getPublicPost(slug);
  if (!post) return {};
  const path = `/blog/${post.slug}`;
  return {
    title: post.title,
    description: post.text,
    alternates: localizedAlternates(path, "en"),
    // Article bodies have not yet been translated. Avoid claiming they are
    // locale-specific variants to crawlers while keeping them usable in the UI.
    robots: { index: false, follow: true },
    openGraph: { title: post.title, description: post.text, images: [post.image] },
  };
}

export default async function LocalizedBlogDetailPage({ params }: LocalizedBlogDetailProps) {
  const { locale, slug } = await params;
  if (!isLocalizedLocale(locale)) notFound();
  const post = await getPublicPost(slug);
  if (!post) notFound();
  const blog = localizedSite[locale].nav["/blog"];

  return (
    <InteriorFrame path={`/blog/${post.slug}`} locale={locale} breadcrumbs={[{ label: blog, href: localizedPath("/blog", locale) }, { label: post.title }]}>
      <ArticleReader title={post.title} label={post.category} text={post.text} date={post.date} image={post.image} content={post.content}
        back={{ href: localizedPath("/blog", locale), label: blog }} lang="en" />
    </InteriorFrame>
  );
}
