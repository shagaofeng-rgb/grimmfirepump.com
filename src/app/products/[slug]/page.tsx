import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { StickyCta } from "@/components/sticky-cta";
import { ProductInquiryForm } from "@/components/product-inquiry-form";
import { company, productMegaMenuGroups } from "@/data/site";
import { getPublicProduct, getPublicProducts, type PublicProduct } from "@/lib/public-cms";

type ProductPageProps = { params: Promise<{ slug: string }> };
type Product = PublicProduct;
type DetailImage = { src: string; alt: string };

const ignoredTableLabels = new Set(["Pump", "Model", "Capacity(GPM)", "Head(BAR)", "Power(KW)", "Material", "FQA:"]);

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  const products = await getPublicProducts();
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getPublicProduct(slug);
  if (!product) return {};
  const description = productMetaDescription(product);
  return {
    title: product.title,
    description,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: { title: product.title, description, images: [product.image] },
  };
}

function cleanDetailLines(product: Product) {
  return product.detailLines
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !ignoredTableLabels.has(line))
    .filter((line) => !/^Q\d+:|^A\d+:/i.test(line));
}

function uniqueLines(lines: string[]) {
  return Array.from(new Set(lines.map((line) => line.trim()).filter(Boolean)));
}

function trimMeta(value: string, maxLength = 180) {
  const cleanValue = value.replace(/\s+/g, " ").trim();

  if (cleanValue.length <= maxLength) {
    return cleanValue;
  }

  const trimmed = cleanValue.slice(0, maxLength - 1);
  const lastSpace = trimmed.lastIndexOf(" ");
  return `${trimmed.slice(0, lastSpace > 120 ? lastSpace : trimmed.length).replace(/[,. ]+$/, "")}.`;
}

function productMetaDescription(product: Product) {
  const detailSummary = product.detailLines
    .map((line) => line.trim())
    .filter((line) => line.length > 45 && !/^Q\d+:|^A\d+:/i.test(line))
    .slice(0, 2)
    .join(" ");
  const combined = [product.description, detailSummary, product.specs.join(", ")].filter(Boolean).join(" ");

  return trimMeta(combined || product.summary);
}

function splitSpec(line: string) {
  const [label, ...value] = line.split(":");
  if (!value.length) return { label: "Specification", value: line };
  return { label: label.trim(), value: value.join(":").trim() };
}

function getStructureItems(product: Product) {
  const title = product.title.toLowerCase();
  const category = product.category.toLowerCase();

  if (title.includes("edj") || title.includes("jockey pump set") || title.includes("fire pump set")) {
    return [
      "Main electric fire pump for regular emergency operation.",
      "Diesel engine standby pump for backup water supply.",
      "Jockey pump for pressure maintenance and small leakage compensation.",
      "Control panel, base frame, valves and pipe fittings configured as a package.",
    ];
  }

  if (category.includes("water")) {
    return [
      "Booster pump unit matched with project flow and head.",
      "Variable-frequency control cabinet for constant pressure operation.",
      "Pressure sensor and pressure tank for stable system response.",
      "Compact skid arrangement for domestic and utility water supply rooms.",
    ];
  }

  if (category.includes("sewage")) {
    return [
      "Submersible or integrated lifting pump configuration for wastewater transfer.",
      "Pump body and motor selected by flow, head and medium condition.",
      "Optional cutting, stirring and anti-clogging structures for difficult sewage.",
      "Pump station or drainage package can be configured for project site layout.",
    ];
  }

  if (title.includes("trailer") || title.includes("irrigation")) {
    return [
      "Diesel engine drive for independent operation on remote sites.",
      "Mobile trailer chassis for temporary drainage and water transfer.",
      "Self-priming pump configuration for fast emergency use.",
      "Large-caliber suction and discharge connections selected by site demand.",
    ];
  }

  return [
    "Pump body selected by application, flow and pressure condition.",
    "Motor or diesel driver matched with required power and frequency.",
    "Suction and discharge connections configured for project piping.",
    "Factory assembly and testing support export project documentation.",
  ];
}

function getApplicationItems(product: Product) {
  const title = product.title.toLowerCase();
  const category = product.category.toLowerCase();

  if (category.includes("sewage")) {
    return ["Basement sewage lifting", "Municipal drainage", "Farm wastewater discharge", "Integrated pump station projects"];
  }

  if (category.includes("water")) {
    return ["High-rise building water supply", "Hospital and school water supply", "Water tank pressurization", "Booster room renovation"];
  }

  if (title.includes("trailer") || title.includes("irrigation")) {
    return ["Emergency drainage", "Irrigation projects", "Temporary water transfer", "Flood control and construction sites"];
  }

  return ["Fire pump room", "Industrial plant", "Warehouse fire protection", "Commercial building and infrastructure projects"];
}

function relatedProducts(product: Product, products: Product[]) {
  const sameCategory = products.filter((item) => item.slug !== product.slug && item.category === product.category);
  const fallback = products.filter((item) => item.slug !== product.slug && !sameCategory.some((same) => same.slug === item.slug));
  return [...sameCategory, ...fallback].slice(0, 6);
}

function getDetailImages(product: Product) {
  const importedImages = "detailImages" in product && Array.isArray(product.detailImages) ? product.detailImages : [];
  return importedImages.length ? importedImages : [{ src: product.image, alt: product.title }];
}

function ProductImageGrid({ images, title }: { images: DetailImage[]; title: string }) {
  if (!images.length) return null;

  return (
    <div className="mt-8 grid gap-4 md:grid-cols-2">
      {images.map((image, index) => (
        <figure key={`${image.src}-${index}`} className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
          <div className="relative h-64">
            <Image
              src={image.src}
              alt={image.alt || title}
              fill
              className="object-contain p-4"
              sizes="(min-width: 1024px) 420px, 100vw"
            />
          </div>
          <figcaption className="border-t border-slate-200 bg-white px-4 py-3 text-xs font-bold text-slate-500">
            {index + 1 < 10 ? `0${index + 1}` : index + 1} · {title}
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

function RelatedProductCarousel({ title, items }: { title: string; items: Product[] }) {
  return (
    <div className="mt-8 min-w-0">
      <div className="mb-3 flex items-center justify-between gap-4">
        <h3 className="text-sm font-black uppercase tracking-[0.12em] text-[var(--navy-900)]">{title}</h3>
        <Link className="text-sm font-black text-[var(--orange)]" href="/products">
          All Products
        </Link>
      </div>
      <div className="flex w-full min-w-0 snap-x gap-4 overflow-x-auto pb-3">
        {items.map((item) => (
          <Link
            key={item.slug}
            href={`/products/${item.slug}`}
            className="card grid min-w-[220px] snap-start overflow-hidden transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            <span className="relative h-28 bg-slate-50">
              <Image src={item.image} alt={item.title} fill className="object-contain p-3" sizes="220px" />
            </span>
            <span className="grid gap-2 p-4">
              <span className="text-xs font-black uppercase tracking-[0.08em] text-[var(--orange)]">{item.category}</span>
              <strong className="text-sm leading-5 text-[var(--navy-950)]">{item.title}</strong>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

function ProductSidebar({ activeSlug }: { activeSlug: string }) {
  return (
    <aside className="hidden lg:block">
      <div className="sticky top-24 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_18px_50px_rgba(7,20,38,0.08)]">
        <div className="bg-[var(--navy-950)] p-5 text-white">
          <p className="eyebrow">Product List</p>
          <h2 className="mt-2 text-xl font-black">Browse by category</h2>
        </div>
        <div className="max-h-[calc(100vh-220px)] overflow-y-auto p-4">
          {productMegaMenuGroups.map((group) => (
            <section key={group.title} className="border-b border-slate-100 py-4 first:pt-0 last:border-b-0">
              <Link href={group.href} className="text-sm font-black text-[var(--navy-950)]">
                {group.title}
              </Link>
              <div className="mt-3 grid gap-1">
                {group.items.map((item) => {
                  const slug = item.href.split("/").pop();
                  const active = slug === activeSlug;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`rounded-md px-3 py-2 text-xs font-bold leading-5 ${
                        active ? "bg-orange-50 text-[var(--orange-dark)]" : "text-slate-600 hover:bg-slate-50 hover:text-[var(--navy-900)]"
                      }`}
                    >
                      {item.title}
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </div>
    </aside>
  );
}

function ContentCard({
  id,
  eyebrow,
  title,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="min-w-0 scroll-mt-28 overflow-hidden rounded-lg border border-slate-200 bg-white p-6 shadow-[0_12px_40px_rgba(7,20,38,0.05)] md:p-8">
      <p className="eyebrow mb-3">{eyebrow}</p>
      <h2 className="text-2xl font-black text-[var(--navy-950)] md:text-3xl">{title}</h2>
      <div className="mt-6">{children}</div>
    </section>
  );
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const products = await getPublicProducts();
  const product = products.find((item) => item.slug === slug);
  if (!product) notFound();

  const detailLines = cleanDetailLines(product);
  const overviewLines = uniqueLines([
    product.description,
    ...detailLines.filter((line) => !line.includes(":") && line.length > 40).slice(0, 3),
  ]).slice(0, 4);
  const technicalLines = uniqueLines([...product.specs, ...detailLines.filter((line) => line.includes(":"))]).slice(0, 20);
  const structureItems = getStructureItems(product);
  const applicationItems = getApplicationItems(product);
  const related = relatedProducts(product, products);
  const detailImages = getDetailImages(product);
  const overviewImages = detailImages.slice(0, 3);
  const structureImages = detailImages.slice(3, 8);
  const productUrl = `${company.website}/products/${product.slug}`;
  const metaDescription = productMetaDescription(product);
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    image: Array.from(new Set([product.image, ...detailImages.map((image) => image.src)])).map((src) =>
      src.startsWith("http") ? src : `${company.website}${src}`,
    ),
    description: metaDescription,
    brand: {
      "@type": "Brand",
      name: company.shortName,
    },
    manufacturer: {
      "@type": "Organization",
      name: company.legalName,
      url: company.website,
    },
    category: product.category,
    url: productUrl,
    additionalProperty: technicalLines.slice(0, 12).map((line) => {
      const spec = splitSpec(line);
      return {
        "@type": "PropertyValue",
        name: spec.label,
        value: spec.value,
      };
    }),
    offers: {
      "@type": "Offer",
      url: productUrl,
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      seller: {
        "@type": "Organization",
        name: company.name,
      },
    },
  };
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: company.website,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Products",
        item: `${company.website}/products`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: product.title,
        item: productUrl,
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <Header />
      <main className="bg-[var(--grey-50)]">
        <section className="bg-white">
          <div className="container-shell grid gap-12 py-12 lg:grid-cols-[0.88fr_1.12fr] lg:py-16">
            <div className="relative min-h-[320px] rounded-lg bg-slate-50 md:min-h-[440px]">
              <Image src={product.image} alt={product.title} fill priority className="object-contain p-8" />
            </div>
            <div>
              <p className="eyebrow mb-4">{product.category}</p>
              <h1 className="text-4xl font-black leading-tight text-[var(--navy-950)] md:text-5xl">{product.title}</h1>
              <p className="mt-6 text-lg leading-8 text-slate-600">{product.description}</p>
              <ul className="mt-8 grid gap-3 sm:grid-cols-2">
                {product.specs.slice(0, 6).map((spec) => (
                  <li key={spec} className="flex items-start gap-2 rounded-md bg-blue-50 px-4 py-3 text-sm font-bold text-[var(--navy-800)]">
                    <CheckCircle2 className="mt-0.5 shrink-0 text-[var(--orange)]" size={16} />
                    {spec}
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link className="button button-primary" href="#product-quote">Get Quote</Link>
                <Link className="button button-secondary" href="#technical-data">Technical Data</Link>
              </div>
            </div>
          </div>
        </section>

        <section className="container-shell grid gap-8 py-12 lg:grid-cols-[290px_1fr]">
          <ProductSidebar activeSlug={product.slug} />

          <div className="grid min-w-0 gap-8">
            <nav className="card flex min-w-0 flex-wrap gap-2 p-3 text-sm font-black text-[var(--navy-900)] lg:hidden">
              {["overview", "structure", "applications", "technical-data", "product-quote"].map((id) => (
                <a key={id} className="rounded-md bg-slate-50 px-3 py-2" href={`#${id}`}>
                  {id === "technical-data" ? "Technical Data" : id === "product-quote" ? "Get Quote" : id.replace("-", " ")}
                </a>
              ))}
            </nav>

            <ContentCard id="overview" eyebrow="Product Overview" title="Product overview">
              <div className="grid gap-4 text-base leading-8 text-slate-600">
                {overviewLines.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
              <ProductImageGrid images={overviewImages} title={`${product.title} overview image`} />
            </ContentCard>

            <ContentCard id="structure" eyebrow="Product Structure" title="Main structure and package scope">
              <div className="grid gap-4 md:grid-cols-2">
                {structureItems.map((item, index) => (
                  <div key={item} className="rounded-md bg-slate-50 p-5">
                    <span className="text-sm font-black text-[var(--orange)]">0{index + 1}</span>
                    <p className="mt-2 text-sm font-bold leading-6 text-slate-700">{item}</p>
                  </div>
                ))}
              </div>
              <ProductImageGrid images={structureImages.length ? structureImages : overviewImages} title={`${product.title} structure image`} />
            </ContentCard>

            <ContentCard id="applications" eyebrow="Applications" title="Recommended project applications">
              <div className="grid gap-4 md:grid-cols-2">
                {applicationItems.map((item) => (
                  <div key={item} className="flex items-center gap-3 rounded-md border border-slate-200 p-4">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-orange-50 text-[var(--orange)]">
                      <CheckCircle2 size={18} />
                    </span>
                    <strong className="text-sm text-[var(--navy-950)]">{item}</strong>
                  </div>
                ))}
              </div>
            </ContentCard>

            <ContentCard id="technical-data" eyebrow="Technical Data" title="Specifications and selection data">
              <dl className="grid overflow-hidden rounded-lg border border-slate-200">
                {technicalLines.map((line) => {
                  const spec = splitSpec(line);
                  return (
                    <div key={line} className="grid gap-2 border-b border-slate-200 p-4 last:border-b-0 md:grid-cols-[180px_1fr]">
                      <dt className="text-sm font-black text-[var(--navy-950)]">{spec.label}</dt>
                      <dd className="text-sm leading-6 text-slate-600">{spec.value}</dd>
                    </div>
                  );
                })}
              </dl>
              <RelatedProductCarousel title="Related products" items={related} />
            </ContentCard>

            <section id="product-quote" className="scroll-mt-28 rounded-lg bg-[var(--navy-950)] p-6 md:p-8">
              <div className="grid gap-8 lg:grid-cols-[0.78fr_1.22fr]">
                <div>
                  <p className="eyebrow mb-3">Get Quote</p>
                  <h2 className="text-3xl font-black leading-tight text-white">Request price and technical data for {product.title}.</h2>
                  <p className="mt-5 text-sm leading-7 text-slate-300">
                    Send your working condition and we will reply with model recommendation, datasheet and quotation support.
                  </p>
                  <Link className="mt-6 inline-flex items-center gap-2 font-black text-[var(--orange)]" href="/contact">
                    Contact sales center
                    <ArrowRight size={16} />
                  </Link>
                </div>
                <ProductInquiryForm productTitle={product.title} />
              </div>
            </section>
          </div>
        </section>
      </main>
      <Footer />
      <StickyCta />
    </>
  );
}
