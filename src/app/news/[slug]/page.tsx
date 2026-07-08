import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { StickyCta } from "@/components/sticky-cta";
import { company } from "@/data/site";
import { getNewsArticle, listPublishedNews } from "@/lib/news-automation";

type NewsDetailProps = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  const news = await listPublishedNews();
  return news.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: NewsDetailProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getNewsArticle(slug);
  if (!article) return {};
  return {
    title: article.seoTitle || article.title,
    description: article.seoDescription || article.summary,
    alternates: { canonical: `/news/${article.slug}` },
    openGraph: {
      title: article.title,
      description: article.summary,
      url: `${company.website}/news/${article.slug}`,
      images: [{ url: article.coverImageUrl, width: article.coverImageWidth || 1200, height: article.coverImageHeight || 630, alt: article.coverImageAlt }],
      type: "article",
      publishedTime: article.publishAt || article.sourcePublishedAt,
      modifiedTime: article.updatedAt,
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.summary,
      images: [article.coverImageUrl],
    },
  };
}

export default async function NewsDetailPage({ params }: NewsDetailProps) {
  const { slug } = await params;
  const article = await getNewsArticle(slug);
  if (!article) notFound();

  const url = `${company.website}/news/${article.slug}`;
  const newsSchema = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.summary,
    image: [article.coverImageUrl],
    datePublished: article.publishAt || article.sourcePublishedAt,
    dateModified: article.updatedAt,
    author: { "@type": "Organization", name: company.shortName, url: company.website },
    publisher: {
      "@type": "Organization",
      name: company.shortName,
      logo: { "@type": "ImageObject", url: `${company.website}/assets/images/logo.png` },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    citation: article.sourceCanonicalUrl || article.sourceUrl,
  };
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: company.website },
      { "@type": "ListItem", position: 2, name: "News", item: `${company.website}/news` },
      { "@type": "ListItem", position: 3, name: article.title, item: url },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(newsSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <Header />
      <main>
        <article className="container-shell max-w-4xl py-14 lg:py-20">
          <p className="eyebrow mb-4">{article.category}</p>
          <h1 className="text-4xl font-black leading-tight text-[var(--navy-950)] md:text-5xl">{article.title}</h1>
          <div className="mt-5 flex flex-wrap gap-4 text-sm font-bold text-slate-500">
            <span>Published {(article.publishAt || article.sourcePublishedAt).slice(0, 10)}</span>
            <span>Source: {article.sourceName}</span>
            <a className="text-[var(--navy-800)] underline decoration-[var(--orange)] underline-offset-4" href={article.sourceUrl} target="_blank" rel="noreferrer">
              View original source
            </a>
          </div>
          <p className="mt-6 text-xl leading-9 text-slate-600">{article.summary}</p>
          <figure className="mt-10 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
            <img src={article.coverImageUrl} alt={article.coverImageAlt} className="aspect-[16/9] w-full object-cover" loading="eager" />
            <figcaption className="border-t border-slate-200 bg-white px-4 py-3 text-xs font-bold text-slate-500">
              Image source: <a href={article.coverImagePageUrl} target="_blank" rel="noreferrer" className="underline">{article.coverImagePageUrl}</a>
            </figcaption>
          </figure>

          <section className="mt-10 rounded-lg border border-slate-200 bg-slate-50 p-6">
            <h2 className="text-xl font-black text-[var(--navy-950)]">Source facts used</h2>
            <ul className="mt-4 grid gap-3 text-sm leading-6 text-slate-700">
              {article.sourceFacts.map((fact) => (
                <li key={fact} className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--orange)]" />
                  <span>{fact}</span>
                </li>
              ))}
            </ul>
          </section>

          <div className="mt-10 grid gap-6 text-base leading-8 text-slate-700">
            {article.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          <section className="mt-12 rounded-lg border border-slate-200 p-6">
            <h2 className="text-2xl font-black text-[var(--navy-950)]">Related GRIMM products</h2>
            <div className="mt-5 grid gap-3">
              {article.relatedProducts.map((product) => (
                <Link key={product.slug} href={`/products/${product.slug}`} className="flex items-center justify-between gap-4 rounded-md bg-slate-50 px-4 py-3 text-sm font-black text-[var(--navy-900)] hover:bg-orange-50">
                  <span>{product.title}</span>
                  <ArrowRight size={16} className="text-[var(--orange)]" />
                </Link>
              ))}
            </div>
          </section>

          <section className="mt-12 rounded-lg bg-[var(--navy-950)] p-7 text-white">
            <h2 className="text-2xl font-black">Need to connect this topic to your project?</h2>
            <p className="mt-3 max-w-2xl leading-7 text-slate-300">
              Send the project country, flow, head, voltage and application. GRIMM can prepare pump package selection and quotation support.
            </p>
            <Link className="button button-primary mt-6" href="/contact">Ask an Engineer</Link>
          </section>
        </article>
      </main>
      <Footer />
      <StickyCta />
    </>
  );
}
