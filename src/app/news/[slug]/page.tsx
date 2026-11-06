import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { ArticleReader } from "@/components/interior/editorial";
import { InteriorFrame } from "@/components/interior/frame";
import { company } from "@/data/site";
import { getNewsArticle } from "@/lib/news-automation";
import { safeArticleImageUrl } from "@/lib/article-content";

type NewsDetailProps = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";

function newsMetaDescription(article: NonNullable<Awaited<ReturnType<typeof getNewsArticle>>>) {
  const current = article.seoDescription || article.summary;
  if (!/^(An independently edited summary of|A buyer-focused engineering note on)\b/i.test(current)) return current;

  const sourceFact = article.sourceFacts.find((fact) =>
    !/published the original update|uses this public update|original reporting/i.test(fact),
  );
  const description = [article.title.replace(/[.!?]+$/, ""), sourceFact || `${article.sourceName} industry update`]
    .filter(Boolean)
    .join(". ");
  return description.length > 160 ? `${description.slice(0, 157).trimEnd()}...` : description;
}

export async function generateMetadata({ params }: NewsDetailProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getNewsArticle(slug);
  if (!article) return {};
  const description = newsMetaDescription(article);
  return {
    title: article.seoTitle || article.title,
    description,
    alternates: { canonical: `/news/${article.slug}` },
    openGraph: {
      title: article.title,
      description,
      url: `${company.website}/news/${article.slug}`,
      images: [{ url: article.coverImageUrl, width: article.coverImageWidth || 1200, height: article.coverImageHeight || 630, alt: article.coverImageAlt }],
      type: "article",
      publishedTime: article.publishAt || article.sourcePublishedAt,
      modifiedTime: article.updatedAt,
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description,
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
  const imageSource = safeArticleImageUrl(article.coverImagePageUrl);
  const sourceUrl = safeArticleImageUrl(article.sourceUrl);
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
    <InteriorFrame path={`/news/${article.slug}`} breadcrumbs={[{ label: "News", href: "/news" }, { label: article.title }]}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(newsSchema).replace(/</g, "\\u003c") }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema).replace(/</g, "\\u003c") }} />
      <ArticleReader title={article.title} label={article.category} date={(article.publishAt || article.createdAt).slice(0, 10)} text={article.summary}
        image={article.coverImageUrl} imageAlt={article.coverImageAlt} content={article.body} back={{ label: "Back to industry news", href: "/news" }}
        imageCredit={imageSource && <>Image source: <a className="underline" href={imageSource} target="_blank" rel="noreferrer">{sourcePageHost}</a></>}
        source={
          <section className="interior-source">
            <h2 className="interior-subtitle">Original source and editorial note</h2>
            <dl className="interior-copy mt-3 grid gap-1 text-sm">
              <div><dt className="inline font-bold">Source: </dt><dd className="inline">{article.sourceName}</dd></div>
              <div><dt className="inline font-bold">Original date: </dt><dd className="inline">{article.sourcePublishedAt.slice(0, 10)}</dd></div>
              {article.sourceAuthor && <div><dt className="inline font-bold">Author: </dt><dd className="inline">{article.sourceAuthor}</dd></div>}
              <div><dt className="inline font-bold">Image use: </dt><dd className="inline">{article.imageLicenseStatus || "owned-neutral"}</dd></div>
            </dl>
            {sourceUrl && <a className="interior-text-link mt-3" href={sourceUrl} target="_blank" rel="noreferrer">Read the original source <ExternalLink size={15} /></a>}
            <p className="interior-copy mt-3 text-sm">{article.editorialDisclaimer || "This page is an independent editorial summary and analysis. Original reporting and factual claims remain attributable to the linked source."}</p>
            {article.sourceFacts.length > 0 && <details className="interior-form-more mt-3"><summary>Source facts used <span aria-hidden="true">+</span></summary><ul className="interior-copy list-disc space-y-2 ps-5 text-sm">{article.sourceFacts.map((fact, index) => <li key={index}>{fact}</li>)}</ul></details>}
          </section>
        }
      />
    </InteriorFrame>
  );
}
