import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { StickyCta } from "@/components/sticky-cta";
import { posts } from "@/data/site";

type BlogDetailProps = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: BlogDetailProps): Promise<Metadata> {
  const { slug } = await params;
  const post = posts.find((item) => item.slug === slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.text,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: { title: post.title, description: post.text, images: [post.image] },
  };
}

export default async function BlogDetailPage({ params }: BlogDetailProps) {
  const { slug } = await params;
  const post = posts.find((item) => item.slug === slug);
  if (!post) notFound();

  return (
    <>
      <Header />
      <main>
        <article className="container-shell max-w-4xl py-16 lg:py-20">
          <p className="eyebrow mb-4">{post.category}</p>
          <h1 className="text-4xl font-black leading-tight text-[var(--navy-950)] md:text-5xl">{post.title}</h1>
          <div className="mt-5 flex flex-wrap gap-4 text-sm font-bold text-slate-500">
            <span>{post.date || "News"}</span>
            <a className="text-[var(--navy-800)] underline decoration-[var(--orange)] underline-offset-4" href={post.sourceUrl} target="_blank" rel="noreferrer">
              Original website page
            </a>
          </div>
          <p className="mt-6 text-xl leading-9 text-slate-600">{post.text}</p>
          <div className="relative mt-10 aspect-[16/9] overflow-hidden rounded-lg bg-slate-100">
            <Image src={post.image} alt={post.title} fill priority className="object-cover" />
          </div>
          <div className="mt-10 grid gap-5 text-base leading-8 text-slate-700">
            {post.content.slice(0, 36).map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
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
