import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowRight, Building2, Check, Download, FileText, Gauge, Layers, Mail, PanelsTopLeft, Ruler, Waves } from "lucide-react";
import { ProductCard } from "@/components/interior/catalog";
import { InteriorFrame, InteriorTabs, SectionHeading } from "@/components/interior/frame";
import { ProductGallery } from "@/components/interior/media";
import { ProductInquiryForm } from "@/components/product-inquiry-form";
import { applications, company } from "@/data/site";
import { catalogHref, displayParameter, keyParameters } from "@/lib/catalog-presentation";
import { getRelatedNewsForProduct } from "@/lib/news-automation";
import { getPublicProduct, getPublicProductKnowledge, getPublicProducts, type PublicProduct } from "@/lib/public-cms";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ view?: string }>;
};

const views = [
  { id: "overview", label: "Overview", icon: PanelsTopLeft },
  { id: "configuration", label: "Configuration", icon: Layers },
  { id: "technical", label: "Technical data", icon: Gauge },
  { id: "applications", label: "Applications", icon: Building2 },
  { id: "resources", label: "Documents", icon: FileText },
  { id: "quote", label: "Request a quote", icon: Mail },
] as const;
type ProductView = (typeof views)[number]["id"];

function productMetaDescription(product: PublicProduct) {
  const text = `${product.title}. ${product.description || product.summary}`.replace(/\s+/g, " ").trim();
  return text.length > 170 ? `${text.slice(0, 169).replace(/\s+\S*$/, "").replace(/[., ]+$/, "")}.` : text;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Pick<ProductPageProps, "params">): Promise<Metadata> {
  const product = await getPublicProduct((await params).slug);
  if (!product) return {};
  const title = product.seoTitle || product.title;
  const description = product.seoDescription || productMetaDescription(product);
  return {
    title,
    description,
    alternates: { canonical: product.canonicalUrl || `/products/${product.slug}` },
    robots: { index: product.indexable, follow: true },
    openGraph: { title, description, url: product.canonicalUrl, images: [product.ogImage] },
    twitter: { card: "summary_large_image", title, description, images: [product.ogImage] },
  };
}

function ProductChecklist({ title, lines }: { title: string; lines: string[] }) {
  return (
    <aside className="interior-detail-aside">
      <FileText size={24} />
      <h3 className="my-2">{title}</h3>
      <ul className="interior-check-list">{lines.map((line) => <li key={line}><Check size={15} />{line}</li>)}</ul>
    </aside>
  );
}

const projectInputs = ["Flow and pressure at the duty point", "Power, driver and water source", "Applicable drawings and documents"];

function SpecificationTable({ product }: { product: PublicProduct }) {
  const rows = product.parameters.filter((param) => param.name.trim() && param.value.trim()).map(displayParameter);
  if (!rows.length) return <p className="interior-copy">Model-specific performance data is available on request.</p>;
  return (
    <div className="interior-table-scroll">
      <table className="interior-table">
        <caption className="sr-only">{product.title} technical data</caption>
        <thead><tr><th scope="col">Parameter</th><th scope="col">Value</th><th scope="col">Unit</th></tr></thead>
        <tbody>{rows.map(({ name, value, unit }, i) => <tr key={`${name}-${i}`}><th scope="row">{name}</th><td>{value}</td><td>{unit || "—"}</td></tr>)}</tbody>
      </table>
    </div>
  );
}

export default async function ProductDetailPage({ params, searchParams }: ProductPageProps) {
  const [{ slug }, { view }] = await Promise.all([params, searchParams]);
  const product = await getPublicProduct(slug);
  if (!product) notFound();

  const path = `/products/${product.slug}`;
  const hrefForView = (id: ProductView) => id === "overview" ? path : catalogHref(path, { view: id });
  const active = view === "documents" ? "resources" : views.find((entry) => entry.id === view)?.id || "overview";
  const images = Array.from(new Map([{ src: product.image, alt: product.title }, ...product.detailImages].map((item) => [item.src, item])).values());
  const specs = keyParameters(product.parameters);
  const { details: knowledge, summary } = await getPublicProductKnowledge(product);
  const matchedApplications = applications.filter((app) => knowledge?.relatedApplicationSlugs.includes(app.slug));
  const related = active === "overview" || active === "resources"
    ? (await getPublicProducts()).filter((item) => item.slug !== product.slug && item.groupSlug === product.groupSlug).slice(0, 3)
    : [];
  const relatedNews = active === "resources" ? await getRelatedNewsForProduct(product.slug, 3) : [];
  const title = product.title;
  const deck = summary || product.description || product.summary;
  const familyHref = catalogHref("/products", { group: product.groupSlug });
  const productUrl = `${company.website}${path}`;
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        name: title,
        description: productMetaDescription(product),
        image: images.map((image) => new URL(image.src, company.website).href),
        brand: { "@type": "Brand", name: company.shortName },
        manufacturer: { "@type": "Organization", name: company.legalName, url: company.website },
        category: product.category,
        url: productUrl,
        additionalProperty: product.parameters.slice(0, 12).map(displayParameter).map(({ name, value, unit }) => ({
          "@type": "PropertyValue", name, value, ...(unit ? { unitText: unit } : {}),
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { name: "Home", item: company.website },
          { name: "Products", item: `${company.website}/products` },
          { name: title, item: productUrl },
        ].map((item, index) => ({ "@type": "ListItem", position: index + 1, ...item })),
      },
    ],
  };

  return (
    <InteriorFrame path={path} breadcrumbs={[{ label: "Products", href: "/products" }, { label: product.category, href: familyHref }, { label: title }]}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
      <section className="interior-white">
        <div className="interior-shell interior-product-top">
          <div className="interior-product-heading">
            <p className="interior-kicker">{product.category}</p>
            <h1 className="interior-title">{title}</h1>
            <p className="interior-deck">{deck}</p>
          </div>
          <ProductGallery key={product.slug} title={title} model={product.model} images={images} />
          <div className="interior-product-summary">
            {specs.length > 0 && (
              <dl className="interior-specs">
                {specs.map(({ name, value, unit }) => {
                  const Icon = /flow|capacity/i.test(name) ? Waves : /diameter|size/i.test(name) ? Ruler : Gauge;
                  return <div key={name}><dt><Icon size={15} />{name}</dt><dd>{value} {unit && <small className="text-xs">{unit}</small>}</dd></div>;
                })}
              </dl>
            )}
            <div className={`interior-actions${specs.length ? "" : " mt-4"}`}>
              <Link className="interior-button interior-primary" href={`${hrefForView("quote")}#product-information`} prefetch={false}>Request a quote <ArrowRight size={16} /></Link>
              <Link className="interior-button" href={`${hrefForView("technical")}#product-information`} prefetch={false}>Technical data <Gauge size={16} /></Link>
            </div>
          </div>
        </div>
      </section>
      <div className="interior-shell interior-anchor" id="product-information">
        <InteriorTabs label="Product information" links={views.map(({ id, label, icon: Icon }) => ({ label, href: hrefForView(id), current: active === id, icon: <Icon size={16} /> }))} />
        <section className="interior-detail-panel" aria-label={views.find((item) => item.id === active)?.label}>
          {active === "overview" && (
            <>
              <div className="interior-split">
                <div>
                  <SectionHeading eyebrow="Product overview" title={product.slug === "edj-fire-pump-set" ? "One package, three pump roles" : "Product overview"} />
                  <p className="interior-copy">{deck}</p>
                  {product.structureItems[0] && <p className="interior-copy mt-3">{product.structureItems[0]}</p>}
                  <Link className="interior-text-link mt-4" href={hrefForView("configuration")} scroll={false} prefetch={false}>View configuration <ArrowRight size={15} /></Link>
                </div>
                <ProductChecklist title="Project information" lines={projectInputs} />
              </div>
              {related.length > 0 && <div className="mt-9"><SectionHeading title="Related products" /><div className="interior-grid">{related.map((item) => <ProductCard key={item.slug} product={item} compact />)}</div></div>}
            </>
          )}
          {active === "configuration" && (
            <div className="interior-split">
              <div>
                <SectionHeading eyebrow="Configuration" title="Structure and package scope" />
                {product.structureItems.length ? <ul className="interior-check-list">{product.structureItems.map((line, index) => <li key={index}><Check size={16} />{line}</li>)}</ul>
                  : <p className="interior-copy">Configuration is confirmed for the selected model and duty point.</p>}
              </div>
              <ProductChecklist title="Selection inputs" lines={projectInputs} />
            </div>
          )}
          {active === "technical" && (
            <div className="interior-split">
              <div><SectionHeading eyebrow="Technical data" title="Specifications and selection data" /><SpecificationTable product={product} />
                <p className="interior-copy mt-4 text-sm">Confirm the final performance curve and connection details for the quoted configuration.</p>
              </div>
              <aside className="interior-detail-aside"><FileText size={24} /><h3 className="my-2">Model-specific documents</h3><Link className="interior-text-link" href={hrefForView("quote")} scroll={false} prefetch={false}>Request a curve or drawing <ArrowRight size={15} /></Link></aside>
            </div>
          )}
          {active === "applications" && (
            <div className="interior-split">
              <div>
                <SectionHeading eyebrow="Applications" title="Project applications" />
                {product.applicationItems.length ? <ul className="interior-check-list">{product.applicationItems.map((line, index) => <li key={index}><Check size={16} />{line}</li>)}</ul>
                  : <p className="interior-copy">Application suitability depends on the required flow, head and installation conditions.</p>}
                {matchedApplications.map((app) => <div key={app.slug} className="mt-3"><Link className="interior-text-link" href={`/applications/${app.slug}`} prefetch={false}>{app.title} <ArrowRight size={15} /></Link></div>)}
              </div>
              {!!knowledge?.specificationKeywords.length && <ProductChecklist title="Information to confirm" lines={knowledge.specificationKeywords} />}
            </div>
          )}
          {active === "resources" && (
            <div className="interior-split">
              <div>
                <SectionHeading eyebrow="Documents" title="Catalog and project documents" />
                <div className="interior-actions">
                  <Link className="interior-button interior-primary" href="/downloads" prefetch={false}><Download size={16} /> Download center</Link>
                  <Link className="interior-button" href={hrefForView("quote")} scroll={false} prefetch={false}>Request a technical file <ArrowRight size={15} /></Link>
                </div>
                {relatedNews.length > 0 && <div className="mt-7"><h3 className="text-lg font-extrabold">Related industry news</h3>
                  <ul className="mt-3 grid gap-3">{relatedNews.map((item) => <li key={item.id}><Link className="interior-text-link" href={`/news/${item.slug}`} prefetch={false}>{item.title} <ArrowRight size={15} /></Link></li>)}</ul>
                </div>}
                {related.length > 0 && <div className="mt-8"><h3 className="text-lg font-extrabold">Related products</h3><ul className="mt-2 grid gap-2">{related.map((item) => <li key={item.slug}><Link className="interior-text-link" href={`/products/${item.slug}`} prefetch={false}>{item.title} <ArrowRight size={15} /></Link></li>)}</ul></div>}
              </div>
              {!!knowledge?.buyerPainPoints.length && <ProductChecklist title="Selection checklist" lines={knowledge.buyerPainPoints} />}
            </div>
          )}
          {active === "quote" && (
            <div className="interior-split interior-quote-split">
              <div><SectionHeading eyebrow="Project inquiry" title={`Request a quote for ${title}`} /><ul className="interior-check-list">{projectInputs.map((line) => <li key={line}><Check size={16} />{line}</li>)}</ul>
                <a className="interior-text-link mt-4" href={`mailto:${company.email}`}><Mail size={16} />{company.email}</a>
              </div>
              <div className="interior-form-surface"><ProductInquiryForm productTitle={title} /></div>
            </div>
          )}
        </section>
      </div>
    </InteriorFrame>
  );
}
