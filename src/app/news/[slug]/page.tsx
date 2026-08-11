import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { company } from "@/data/site";
import { getNewsArticle, listPublishedNews } from "@/lib/news-automation";
import { ArticleContent } from "@/components/article-content";
import { safeArticleImageUrl } from "@/lib/article-content";

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
    robots: article.indexable === true && article.generatedModel === "grimm-news-v2" ? { index: true, follow: true } : { index: false, follow: true },
  };
}

export default async function NewsDetailPage({ params }: NewsDetailProps) {
  const { slug } = await params;
  const article = await getNewsArticle(slug);
  if (!article) notFound();

  const url = `${company.website}/news/${article.slug}`;
  const sourcePageHost = (() => {
    try { return new URL(article.coverImagePageUrl).hostname; } catch { return "Source page"; }
  })();
  const newsSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
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
          <h1 className="article-title break-words text-3xl font-black leading-tight text-[var(--navy-950)] md:text-5xl">{article.title}</h1>
          <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-sm font-bold text-slate-500"><span>Editorial publication: {(article.publishAt || article.createdAt).slice(0, 10)}</span><span>Original publication: {article.sourcePublishedAt.slice(0, 10)}</span></div>
          <p className="article-content-copy mt-6 text-xl leading-9 text-slate-600">{article.summary}</p>
          <figure className="mt-10 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
            <img src={safeArticleImageUrl(article.coverImageUrl)} alt={article.coverImageAlt} className="aspect-[16/9] h-auto w-full object-cover" loading="eager" decoding="async" />
            <figcaption className="article-content-copy border-t border-slate-200 bg-white px-4 py-3 text-xs font-bold text-slate-500">
              Image source: <a href={article.coverImagePageUrl} target="_blank" rel="noreferrer" className="underline">{sourcePageHost}</a>
            </figcaption>
          </figure>

          <section className="mt-10 rounded-lg border border-slate-200 bg-slate-50 p-6">
            <h2 className="text-xl font-black text-[var(--navy-950)]">Original source and editorial note</h2>
            <dl className="mt-4 grid gap-2 text-sm leading-6 text-slate-700">
              <div><dt className="inline font-black">Source: </dt><dd className="inline">{article.sourceName}</dd></div>
              <div><dt className="inline font-black">Original date: </dt><dd className="inline">{article.sourcePublishedAt.slice(0, 10)}</dd></div>
              {article.sourceAuthor ? <div><dt className="inline font-black">Author: </dt><dd className="inline">{article.sourceAuthor}</dd></div> : null}
              <div><dt className="inline font-black">Image use: </dt><dd className="inline">{article.imageLicenseStatus || "owned-neutral"}</dd></div>
              <div><a className="font-black text-[var(--navy-800)] underline decoration-[var(--orange)] underline-offset-4" href={article.sourceUrl} target="_blank" rel="noreferrer">Read the original source</a></div>
            </dl>
            <p className="article-content-copy mt-5 border-t border-slate-200 pt-5 text-sm leading-7 text-slate-600">{article.editorialDisclaimer || "This page is an independent editorial summary and analysis. Original reporting and factual claims remain attributable to the linked source."}</p>
            <h3 className="mt-6 text-base font-black text-[var(--navy-950)]">Source facts used</h3>
            <ul className="mt-4 grid gap-3 text-sm leading-6 text-slate-700">
              {article.sourceFacts.map((fact) => (
                <li key={fact} className="flex min-w-0 gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--orange)]" />
                  <span className="article-content-copy">{fact}</span>
                </li>
              ))}
            </ul>
          </section>

          <ArticleContent content={article.body} />

        </article>
      </main>
      <Footer />
    </>
  );
}
