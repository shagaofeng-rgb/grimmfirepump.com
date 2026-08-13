import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Footer } from "@/components/footer";
import { StickyCta } from "@/components/sticky-cta";
import { company } from "@/data/site";
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

  return (
    <>
      <main>
        <article className="container-shell max-w-4xl py-16 lg:py-20">
          <Link className="text-sm font-black text-[var(--navy-800)] underline decoration-[var(--orange)] underline-offset-4" href={localizedPath("/blog", locale)}>
            {company.shortName} Blog
          </Link>
          <p className="eyebrow mb-4 mt-8">{post.category}</p>
          <h1 className="text-4xl font-black leading-tight text-[var(--navy-950)] md:text-5xl">{post.title}</h1>
          <p className="mt-5 text-sm font-bold text-slate-500">{post.date}</p>
          <p className="mt-6 text-xl leading-9 text-slate-600">{post.text}</p>
          <div className="relative mt-10 aspect-[16/9] overflow-hidden rounded-lg bg-slate-100">
            <Image src={post.image} alt={post.title} fill priority className="object-cover" />
          </div>
          <div className="mt-10 grid gap-5 text-base leading-8 text-slate-700">
            {post.content.slice(0, 36).map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </div>
        </article>
      </main>
      <Footer />
      <StickyCta />
    </>
  );
}
