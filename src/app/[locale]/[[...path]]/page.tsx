import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowRight, Menu, Search } from "lucide-react";
import { StickyCta } from "@/components/sticky-cta";
import { FooterSocialLinks } from "@/components/footer";
import { applications, company, factoryImages, knowledgePosts, projects } from "@/data/site";
import { certificatePreviews } from "@/data/certificate-previews";
import { InteriorFrame, PageMast, SectionHeading } from "@/components/interior/frame";
import { MediaCard } from "@/components/interior/content";
import { ProductCard } from "@/components/interior/catalog";
import { EditorialRows } from "@/components/interior/editorial";
import { ContentPagination, getPageNumber, getPageSlice } from "@/components/content-pagination";
import { localizedSite } from "@/data/localized-site";
import {
  isLocalizedLocale,
  isLocalizedPathIndexable,
  isSupportedLocalizedPath,
  localizedAlternates,
  localizedLocales,
  localizedPath,
  normalizeLocalizedPath,
  supportedLocalizedPaths,
  type LocalizedLocale,
  type LocalizedPath,
} from "@/lib/i18n";
import { getPublicPosts, getPublicProducts } from "@/lib/public-cms";
import { listDownloadAssets } from "@/lib/admin-cms";
import { listPublishedNews } from "@/lib/news-automation";

export const dynamic = "force-dynamic";

type LocalizedPageProps = {
  params: Promise<{ locale: string; path?: string[] }>;
  searchParams: Promise<{ page?: string }>;
};

function currentPath(path?: string[]) {
  return normalizeLocalizedPath(path?.length ? path.join("/") : "/");
}

export function generateStaticParams() {
  return localizedLocales.flatMap((locale) =>
    supportedLocalizedPaths.map((path) => ({
      locale,
      path: path === "/" ? [] : path.slice(1).split("/"),
    })),
  );
}

export async function generateMetadata({ params }: Pick<LocalizedPageProps, "params">): Promise<Metadata> {
  const { locale, path } = await params;
  if (!isLocalizedLocale(locale)) return {};

  const pagePath = currentPath(path);
  if (!isSupportedLocalizedPath(pagePath)) return {};

  const content = localizedSite[locale];
  const page = content.pages[pagePath];
  const indexable = isLocalizedPathIndexable(pagePath);

  return {
    title: pagePath === "/" ? content.home.title : page.title,
    description: page.text,
    alternates: localizedAlternates(pagePath, indexable ? locale : "en"),
    robots: indexable ? { index: true, follow: true } : { index: false, follow: true },
    openGraph: {
      title: page.title,
      description: page.text,
      locale: content.htmlLang,
      images: ["/assets/applications/hero-edj.webp"],
    },
  };
}

function LocalizedHeader({ locale }: { locale: LocalizedLocale }) {
  const content = localizedSite[locale];
  const navPaths: LocalizedPath[] = ["/", "/products", "/applications", "/projects", "/factory", "/downloads", "/contact"];

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/92 backdrop-blur-xl" lang={content.htmlLang} dir={content.dir}>
      <div className="mx-auto flex min-h-[76px] max-w-[1280px] items-center justify-between gap-3 px-4 py-3 md:px-6">
        <Link href={localizedPath("/", locale)} className="flex min-w-0 items-center gap-3" aria-label={`${company.shortName} home`}>
          <Image src="/assets/images/logo.png" alt={`${company.shortName} logo`} width={42} height={42} className="object-contain" />
          <span className="flex flex-col leading-none">
            <strong className="text-base tracking-[0.04em] text-[var(--navy-900)]">{company.shortName}</strong>
            <small className="mt-1 text-xs text-slate-500">Fire Pump Systems</small>
          </span>
        </Link>
        <nav className="hidden items-center gap-4 text-sm font-bold text-slate-700 lg:flex" aria-label={`${content.localeName} navigation`}>
          {navPaths.map((navPath) => (
            <Link key={navPath} href={localizedPath(navPath, locale)} className="shrink-0 border-b-2 border-transparent py-2 hover:border-[var(--orange)]">
              {content.nav[navPath]}
            </Link>
          ))}
        </nav>
        <a className="button button-primary hidden min-h-[42px] px-4 text-sm sm:inline-flex" href={company.whatsappUrl} target="_blank" rel="noreferrer" data-event="whatsapp_click" data-whatsapp-account="grimm-main" data-whatsapp-placement="localized_header">
          {content.labels.whatsapp}
        </a>
        <details className="relative lg:hidden">
          <summary className="grid h-11 w-11 cursor-pointer list-none place-items-center rounded-md border border-slate-200 text-[var(--navy-900)]" aria-label={`${content.localeName} navigation`}>
            <Menu size={20} />
          </summary>
          <nav className="absolute end-0 top-14 z-50 grid w-[min(320px,calc(100vw-32px))] gap-1 rounded-lg border border-slate-200 bg-white p-3 text-sm font-bold text-slate-700 shadow-xl" aria-label={`${content.localeName} mobile navigation`}>
            {navPaths.map((navPath) => (
              <Link key={navPath} href={localizedPath(navPath, locale)} className="rounded-md px-3 py-3 hover:bg-slate-50">
                {content.nav[navPath]}
              </Link>
            ))}
            <a className="button button-primary mt-2 min-h-[42px] text-sm sm:hidden" href={company.whatsappUrl} target="_blank" rel="noreferrer" data-event="whatsapp_click" data-whatsapp-account="grimm-main" data-whatsapp-placement="localized_mobile_menu">
              {content.labels.whatsapp}
            </a>
          </nav>
        </details>
      </div>
    </header>
  );
}

function LocalizedHero({ locale, path }: { locale: LocalizedLocale; path: LocalizedPath }) {
  const content = localizedSite[locale];
  const page = content.pages[path];

  return (
    <section className="dark-gradient px-6 py-20" lang={content.htmlLang} dir={content.dir}>
      <div className="mx-auto grid max-w-[1200px] items-center gap-10 lg:grid-cols-[0.92fr_1.08fr]">
        <div>
          <p className="eyebrow mb-4">{path === "/" ? content.home.eyebrow : page.eyebrow}</p>
          <h1 className="max-w-4xl text-4xl font-black leading-tight text-white md:text-6xl">
            {path === "/" ? content.home.title : page.title}
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">
            {path === "/" ? content.home.text : page.text}
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link className="button button-primary" href={localizedPath("/contact", locale)}>
              {page.ctaPrimary}
            </Link>
            <Link className="button button-secondary" href={localizedPath("/downloads", locale)}>
              {page.ctaSecondary}
            </Link>
          </div>
        </div>
        <div className="relative min-h-[310px] overflow-hidden rounded-lg bg-[var(--navy-900)] md:min-h-[430px]">
          <Image
            src="/assets/applications/hero-edj.webp"
            alt={page.title}
            fill
            priority={path === "/"}
            className="object-cover"
            sizes="(min-width: 1024px) 52vw, 100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[rgba(7,20,38,0.52)] to-transparent" />
        </div>
      </div>
    </section>
  );
}

function ProofSection({ locale }: { locale: LocalizedLocale }) {
  const content = localizedSite[locale];
  return (
    <section className="section" lang={content.htmlLang} dir={content.dir}>
      <div className="container-shell grid gap-4 md:grid-cols-3">
        {content.home.proof.map((item, index) => (
          <article key={item} className="card p-6">
            <span className="text-sm font-black text-[var(--orange)]">0{index + 1}</span>
            <h2 className="mt-3 text-xl font-black leading-tight text-[var(--navy-950)]">{item}</h2>
          </article>
        ))}
      </div>
    </section>
  );
}

async function ProductCards({ locale, page }: { locale: LocalizedLocale; page: number }) {
  const content = localizedSite[locale];
  const products = await getPublicProducts();
  const { items, currentPage } = getPageSlice(products, page, 6);
  return (
    <section className="interior-shell interior-band" lang={content.htmlLang} dir={content.dir}>
      <SectionHeading title={content.home.productsTitle}
        action={<Link className="interior-button" href="/products" prefetch={false}>{content.labels.browseEnglishDetails} <ArrowRight size={16} /></Link>} />
      <div className="interior-grid" lang="en" dir="ltr">{items.map((product) => <ProductCard key={product.slug} product={product} />)}</div>
      <ContentPagination locale={locale} currentPage={currentPage} totalItems={products.length} pageSize={6} pathname={localizedPath("/products", locale)} />
    </section>
  );
}

function ApplicationCards({ locale }: { locale: LocalizedLocale }) {
  const content = localizedSite[locale];
  return (
    <section className="interior-shell interior-band" lang={content.htmlLang} dir={content.dir}>
      <SectionHeading title={content.home.applicationsTitle} />
      <div className="interior-grid" lang="en" dir="ltr">
        {applications.map(({ slug, image, title, text, icon: Icon }) => <MediaCard key={slug} image={image} title={title} text={text} href={`/applications/${slug}`} icon={<Icon size={17} />} />)}
      </div>
    </section>
  );
}

function LocalizedHomeLinks({ locale }: { locale: LocalizedLocale }) {
  const content = localizedSite[locale];
  const items: Array<{ path: LocalizedPath; image: string }> = [
    { path: "/products", image: "/assets/applications/hero-edj.webp" },
    { path: "/applications", image: "/assets/applications/diesel-site.webp" },
    { path: "/factory", image: "/assets/factory/real/production-capacity.webp" },
  ];
  return (
    <section className="section bg-[var(--grey-50)]" lang={content.htmlLang} dir={content.dir}>
      <div className="container-shell grid gap-5 md:grid-cols-3">
        {items.map((item) => (
          <Link key={item.path} href={localizedPath(item.path, locale)} className="card overflow-hidden">
            <div className="relative h-44 bg-slate-100">
              <Image src={item.image} alt={content.pages[item.path].title} fill className="object-cover" sizes="(min-width: 768px) 33vw, 100vw" />
            </div>
            <div className="p-5">
              <h2 className="text-xl font-black text-[var(--navy-950)]">{content.pages[item.path].title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">{content.pages[item.path].text}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function LocalizedFooter({ locale, interior = false }: { locale: LocalizedLocale; interior?: boolean }) {
  const content = localizedSite[locale];
  const navPaths: LocalizedPath[] = ["/products", "/applications", "/projects", "/factory", "/downloads", "/contact"];
  return (
    <footer className={`bg-[var(--navy-950)] px-6 pb-20 pt-14 text-slate-300${interior ? " interior-footer" : ""}`} lang={content.htmlLang} dir={content.dir}>
      <div className="mx-auto grid max-w-[1240px] gap-10 md:grid-cols-[1.2fr_0.8fr]">
        <div>
          <Link href={localizedPath("/", locale)} className="flex items-center gap-3">
            <Image src="/assets/images/logo.png" alt={`${company.shortName} logo`} width={42} height={42} className="invert" />
            <strong className="text-white">{company.shortName}</strong>
          </Link>
          <p className="mt-5 max-w-xl text-sm leading-7">{content.home.text}</p>
          <p className="mt-4 text-sm leading-7">{company.legalName}</p>
          <a className="mt-2 block text-sm hover:text-white" href={`mailto:${company.email}`}>{company.email}</a>
          {interior && <FooterSocialLinks />}
        </div>
        <nav className="grid grid-cols-2 gap-3 text-sm font-bold" aria-label={`${content.localeName} footer navigation`}>
          {navPaths.map((path) => <Link key={path} href={localizedPath(path, locale)} className="hover:text-white">{content.nav[path]}</Link>)}
        </nav>
      </div>
    </footer>
  );
}

async function ResourceCards({ locale, path, page }: { locale: LocalizedLocale; path: LocalizedPath; page: number }) {
  const content = localizedSite[locale];
  const blogPosts = path === "/blog" ? await getPublicPosts() : [];
  const news = path === "/news" ? await listPublishedNews() : [];
  const downloadRecords = path === "/downloads" ? (await listDownloadAssets()).filter((item) => item.status === "published" && (item.fileUrl.startsWith("/") && !item.fileUrl.startsWith("//") || item.fileUrl.startsWith("https://"))) : [];
  const downloadUrls = new Set<string>();
  const availableDownloads = downloadRecords.filter((item) => {
    if (downloadUrls.has(item.fileUrl)) return false;
    downloadUrls.add(item.fileUrl);
    return true;
  });
  const cards =
    path === "/projects"
      ? projects.map((item) => ({ title: item.title, text: `${item.region} · Equipment reference`, image: item.region === "South America" ? "/assets/synced/products/interior/edj-fire-pump-set.webp" : item.image, href: "/projects" }))
      : path === "/downloads"
        ? availableDownloads.map((item) => ({ title: item.title, text: `${item.category} · ${item.language}`, image: "/assets/applications/hero-edj.webp", href: "/downloads" }))
        : path === "/certificates"
          ? certificatePreviews.map((item) => ({ title: item.label, text: "", image: item.src, href: "/certificates" }))
          : path === "/blog"
            ? blogPosts.map((item) => ({ title: item.title, text: item.text, image: item.image, href: `/${locale}/blog/${item.slug}` }))
            : path === "/knowledge"
              ? knowledgePosts.map((item) => ({ title: item.title, text: item.text, image: item.image, href: `/knowledge/${item.slug}` }))
              : path === "/news" ? news.map((item) => ({ title: item.title, text: item.summary, image: item.coverImageUrl, href: `/news/${item.slug}`, label: item.sourceName, date: (item.publishAt || item.sourcePublishedAt).slice(0, 10) }))
                : [];
  const { items, currentPage } = getPageSlice(cards, page, 6);

  return (
    <section className="interior-shell interior-band" lang={content.htmlLang} dir={content.dir}>
      <SectionHeading title={content.nav[path]} />
      <div lang="en" dir="ltr">
        {path === "/news" || path === "/blog" || path === "/knowledge"
          ? <EditorialRows items={items.map((item) => ({ label: "", ...item }))} images linkText="Read article" />
          : <div className={`interior-grid${path === "/certificates" ? " interior-grid-4" : ""}`}>
              {items.map((card) => <MediaCard key={`${card.title}-${card.href}`} {...card} contain={path === "/certificates" || card.image.includes("/synced/products/")} />)}
            </div>}
      </div>
      <ContentPagination locale={locale} currentPage={currentPage} totalItems={cards.length} pageSize={6} pathname={localizedPath(path, locale)} />
      {items.length === 0 && <Link className="interior-text-link" href={path === "/blog" ? localizedPath("/knowledge", locale) : "/contact"} prefetch={false}>{path === "/blog" ? content.nav["/knowledge"] : content.labels.contactSales} <ArrowRight size={16} /></Link>}
    </section>
  );
}

function ContactPanel({ locale, interior = false }: { locale: LocalizedLocale; interior?: boolean }) {
  const content = localizedSite[locale];
  if (interior) return (
    <section className="interior-shell interior-band interior-split" lang={content.htmlLang} dir={content.dir}>
      <div><SectionHeading title={content.home.contactTitle} /><div className="interior-actions">
        <a className="interior-button" href={company.whatsappUrl} target="_blank" rel="noreferrer" data-event="whatsapp_click" data-whatsapp-account="grimm-main" data-whatsapp-placement="localized_contact">{content.labels.whatsapp}</a>
        <Link className="interior-button interior-primary" href="/contact" prefetch={false}>{content.labels.contactSales} <ArrowRight size={16} /></Link>
      </div></div>
      <dl className="interior-contact-list"><div><dt>{content.labels.email}</dt><dd><a href={`mailto:${company.email}`} dir="ltr">{company.email}</a></dd></div><div><dt>{company.legalName}</dt><dd lang="en" dir="ltr">{company.address}</dd></div></dl>
    </section>
  );
  return (
    <section className="section" lang={content.htmlLang} dir={content.dir}>
      <div className="container-shell rounded-lg bg-[var(--navy-950)] p-8 text-white md:p-10">
        <p className="eyebrow mb-3">{content.pages["/contact"].eyebrow}</p>
        <h2 className="text-3xl font-black">{content.home.contactTitle}</h2>
        <div className="mt-6 grid gap-3 text-slate-200">
          <a className="font-bold text-white" href={company.whatsappUrl} target="_blank" rel="noreferrer" data-event="whatsapp_click" data-whatsapp-account="grimm-main" data-whatsapp-placement="localized_contact">
            {content.labels.whatsapp}: {company.phone}
          </a>
          <a className="font-bold text-white" href={`mailto:${company.email}`}>
            {content.labels.email}: {company.email}
          </a>
          <p>{company.address}</p>
        </div>
        <div className="mt-8 flex flex-wrap gap-4">
          <a className="button button-primary" href={company.whatsappUrl} target="_blank" rel="noreferrer" data-event="whatsapp_click" data-whatsapp-account="grimm-main" data-whatsapp-placement="localized_contact_cta">
            {content.labels.whatsapp}
          </a>
          <Link className="button button-secondary" href="/contact">
            {content.labels.contactSales}
          </Link>
        </div>
      </div>
    </section>
  );
}

export default async function LocalizedPage({ params, searchParams }: LocalizedPageProps) {
  const { locale, path } = await params;
  if (!isLocalizedLocale(locale)) notFound();

  const pagePath = currentPath(path);
  if (!isSupportedLocalizedPath(pagePath)) notFound();

  if (pagePath !== "/") {
    const content = localizedSite[locale];
    const copy = content.pages[pagePath];
    const page = getPageNumber((await searchParams).page);
    const companyPage = pagePath === "/about" || pagePath === "/factory" || pagePath === "/testing";
    return (
      <InteriorFrame locale={locale} path={pagePath} breadcrumbs={[{ label: content.nav[pagePath] }]} footer={<LocalizedFooter locale={locale} interior />}>
        <PageMast eyebrow={copy.eyebrow} title={copy.title} text={copy.text}
          image={companyPage ? { src: pagePath === "/testing" ? "/assets/factory/factory-testing.webp" : factoryImages[0].src, alt: "" } : undefined}
          action={pagePath === "/tools/fire-pump-selector" ? <Link className="interior-button" href="/tools/fire-pump-selector" prefetch={false}>{content.labels.browseEnglishDetails} <ArrowRight size={16} /></Link> : undefined} />
        {pagePath === "/products" ? <ProductCards locale={locale} page={page} />
          : pagePath === "/applications" ? <ApplicationCards locale={locale} />
          : pagePath === "/contact" ? <ContactPanel locale={locale} interior />
          : companyPage ? <>
            <section className="interior-shell interior-band">
              <SectionHeading title={content.home.evidenceTitle} />
              <ul className="interior-check-list">{content.home.proof.map((item) => <li key={item}>{item}</li>)}</ul>
              <Link className="interior-text-link mt-4" href={pagePath} prefetch={false}>{content.labels.browseEnglishDetails} <ArrowRight size={16} /></Link>
            </section>
            <ContactPanel locale={locale} interior />
          </> : pagePath === "/search" ? (
            <section className="interior-shell interior-band interior-search">
              <form className="interior-toolbar" action="/search" method="get" role="search">
                <label className="interior-field"><span className="sr-only">{content.nav["/search"]}</span><input name="q" type="search" maxLength={120} placeholder={content.nav["/search"]} /></label>
                <button type="submit" className="interior-button interior-primary"><Search size={17} />{content.nav["/search"]}</button>
              </form>
            </section>
          ) : pagePath !== "/tools/fire-pump-selector" && <ResourceCards locale={locale} path={pagePath} page={page} />}
      </InteriorFrame>
    );
  }

  return (
    <>
      <LocalizedHeader locale={locale} />
      <main>
        <LocalizedHero locale={locale} path={pagePath} />
        <ProofSection locale={locale} />
        <LocalizedHomeLinks locale={locale} />
        <ContactPanel locale={locale} />
      </main>
      <LocalizedFooter locale={locale} />
      <StickyCta />
    </>
  );
}
