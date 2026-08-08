import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { StickyCta } from "@/components/sticky-cta";
import { knowledgePosts } from "@/data/site";
import { ArticleContent } from "@/components/article-content";

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
    <>
      <Header />
      <main>
        <article className="container-shell max-w-4xl py-16 lg:py-20">
          <p className="eyebrow mb-4">{post.category}</p>
          <h1 className="article-title break-words text-3xl font-black leading-tight text-[var(--navy-950)] md:text-5xl">{post.title}</h1>
          <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-sm font-bold text-slate-500">
            <span>{post.date}</span>
            <Link className="text-[var(--navy-800)] underline decoration-[var(--orange)] underline-offset-4" href="/knowledge">
              Knowledge Center
            </Link>
          </div>
          <p className="article-content-copy mt-6 text-xl leading-9 text-slate-600">{post.text}</p>
          <div className="relative mt-10 aspect-[16/9] overflow-hidden rounded-lg bg-slate-100">
            <Image src={post.image} alt={post.title} fill priority sizes="(max-width: 767px) calc(100vw - 32px), 896px" className="object-cover" />
          </div>
          <ArticleContent content={post.content} maxBlocks={80} />
          <div className="mt-12 rounded-lg bg-[var(--navy-950)] p-7 text-white">
            <h2 className="text-2xl font-black">Need a project fire pump recommendation?</h2>
            <p className="mt-3 max-w-2xl leading-7 text-slate-300">
              Send flow, pressure, application, voltage and installation conditions. GRIMM can prepare a pump selection and quotation for your project.
            </p>
            <Link className="button button-primary mt-6" href="/contact">Ask an Engineer</Link>
          </div>
        </article>
      </main>
      <Footer />
      <StickyCta />
    </>
  );
}
