import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Footer } from "@/components/footer";
import { StickyCta } from "@/components/sticky-cta";
import { applications, certificates, company, downloads, knowledgePosts, posts, products, projects } from "@/data/site";
import { localizedSite } from "@/data/localized-site";
import {
  isLocalizedLocale,
  isSupportedLocalizedPath,
  localizedAlternates,
  localizedLocales,
  localizedPath,
  normalizeLocalizedPath,
  supportedLocalizedPaths,
  type LocalizedLocale,
  type LocalizedPath,
} from "@/lib/i18n";

type LocalizedPageProps = { params: Promise<{ locale: string; path?: string[] }> };

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

export async function generateMetadata({ params }: LocalizedPageProps): Promise<Metadata> {
  const { locale, path } = await params;
  if (!isLocalizedLocale(locale)) return {};

  const pagePath = currentPath(path);
  if (!isSupportedLocalizedPath(pagePath)) return {};

  const content = localizedSite[locale];
  const page = content.pages[pagePath];

  return {
    title: pagePath === "/" ? content.home.title : page.title,
    description: page.text,
    alternates: localizedAlternates(pagePath, locale),
    robots: pagePath === "/search" ? { index: false, follow: true } : { index: true, follow: true },
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
      <div className="mx-auto flex min-h-[76px] max-w-[1280px] flex-wrap items-center justify-between gap-4 px-6 py-3">
        <Link href={localizedPath("/", locale)} className="flex min-w-[220px] items-center gap-3" aria-label={`${company.shortName} home`}>
          <Image src="/assets/images/logo.png" alt={`${company.shortName} logo`} width={42} height={42} className="object-contain" />
          <span className="flex flex-col leading-none">
            <strong className="text-base tracking-[0.04em] text-[var(--navy-900)]">{company.shortName}</strong>
            <small className="mt-1 text-xs text-slate-500">Fire Pump Systems</small>
          </span>
        </Link>
        <nav className="flex max-w-full items-center gap-4 overflow-x-auto text-sm font-bold text-slate-700" aria-label={`${content.localeName} navigation`}>
          {navPaths.map((navPath) => (
            <Link key={navPath} href={localizedPath(navPath, locale)} className="shrink-0 border-b-2 border-transparent py-2 hover:border-[var(--orange)]">
              {content.nav[navPath]}
            </Link>
          ))}
        </nav>
        <a className="button button-primary min-h-[42px] px-4 text-sm" href={company.whatsappUrl} target="_blank" rel="noreferrer">
          {content.labels.whatsapp}
        </a>
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
            alt="GRIMM PUMP fire pump package"
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

function ProductCards({ locale }: { locale: LocalizedLocale }) {
  const content = localizedSite[locale];
  return (
    <section className="section bg-[var(--grey-50)]" lang={content.htmlLang} dir={content.dir}>
      <div className="container-shell mb-8 flex flex-wrap items-end justify-between gap-4">
        <h2 className="text-3xl font-black text-[var(--navy-950)]">{content.home.productsTitle}</h2>
        <Link className="font-black text-[var(--navy-800)] underline decoration-[var(--orange)] decoration-2 underline-offset-4" href="/products">
          {content.labels.browseEnglishDetails}
        </Link>
      </div>
      <div className="container-shell grid gap-5 md:grid-cols-3">
        {products.slice(0, 3).map((product) => (
          <article key={product.slug} className="card overflow-hidden">
            <div className="relative h-52 bg-slate-50">
              <Image src={product.image} alt={product.title} fill className="object-contain p-5" sizes="(min-width: 768px) 33vw, 100vw" />
            </div>
            <div className="p-5">
              <p className="text-xs font-black uppercase tracking-[0.12em] text-[var(--orange)]">{product.category}</p>
              <h3 className="mt-2 text-xl font-black text-[var(--navy-950)]">{product.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{product.summary}</p>
              <Link className="button button-secondary mt-5" href={`/products/${product.slug}`}>
                {content.labels.browseEnglishDetails}
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function ApplicationCards({ locale }: { locale: LocalizedLocale }) {
  const content = localizedSite[locale];
  return (
    <section className="section" lang={content.htmlLang} dir={content.dir}>
      <div className="container-shell mb-8">
        <h2 className="text-3xl font-black text-[var(--navy-950)]">{content.home.applicationsTitle}</h2>
      </div>
      <div className="container-shell grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {applications.slice(0, 4).map((application) => (
          <Link key={application.slug} className="card overflow-hidden" href={`/applications/${application.slug}`}>
            <div className="relative h-44 bg-slate-100">
              <Image src={application.image} alt={application.title} fill className="object-cover" sizes="(min-width: 1280px) 25vw, 50vw" />
            </div>
            <div className="p-5">
              <h3 className="text-xl font-black text-[var(--navy-950)]">{application.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{application.text}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function ResourceCards({ locale, path }: { locale: LocalizedLocale; path: LocalizedPath }) {
  const content = localizedSite[locale];
  const cards =
    path === "/projects"
      ? projects.map((item) => ({ title: item.title, text: `${item.region} · ${item.meta}`, image: item.image, href: "/projects" }))
      : path === "/downloads"
        ? downloads.map((item) => ({ title: item.title, text: item.text, image: "/assets/applications/hero-edj.webp", href: "/downloads" }))
        : path === "/certificates"
          ? certificates.map((item) => ({ title: item.title, text: item.note, image: item.src, href: "/certificates" }))
          : path === "/blog"
            ? posts.slice(0, 6).map((item) => ({ title: item.title, text: item.text, image: item.image, href: `/blog/${item.slug}` }))
            : path === "/knowledge"
              ? knowledgePosts.slice(0, 6).map((item) => ({ title: item.title, text: item.text, image: item.image, href: `/knowledge/${item.slug}` }))
              : [];

  if (!cards.length) return null;

  return (
    <section className="section bg-[var(--grey-50)]" lang={content.htmlLang} dir={content.dir}>
      <div className="container-shell grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <Link key={`${card.title}-${card.href}`} className="card overflow-hidden" href={card.href}>
            <div className="relative h-44 bg-slate-50">
              <Image
                src={card.image}
                alt={card.title}
                fill
                className={path === "/certificates" ? "object-contain p-4" : "object-cover p-0"}
                sizes="(min-width: 1280px) 30vw, 50vw"
              />
            </div>
            <div className="p-5">
              <h2 className="text-xl font-black text-[var(--navy-950)]">{card.title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">{card.text}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function ContactPanel({ locale }: { locale: LocalizedLocale }) {
  const content = localizedSite[locale];
  return (
    <section className="section" lang={content.htmlLang} dir={content.dir}>
      <div className="container-shell rounded-lg bg-[var(--navy-950)] p-8 text-white md:p-10">
        <p className="eyebrow mb-3">{content.pages["/contact"].eyebrow}</p>
        <h2 className="text-3xl font-black">{content.home.contactTitle}</h2>
        <div className="mt-6 grid gap-3 text-slate-200">
          <a className="font-bold text-white" href={company.whatsappUrl} target="_blank" rel="noreferrer">
            {content.labels.whatsapp}: {company.phone}
          </a>
          <a className="font-bold text-white" href={`mailto:${company.email}`}>
            {content.labels.email}: {company.email}
          </a>
          <p>{company.address}</p>
        </div>
        <div className="mt-8 flex flex-wrap gap-4">
          <a className="button button-primary" href={company.whatsappUrl} target="_blank" rel="noreferrer">
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

export default async function LocalizedPage({ params }: LocalizedPageProps) {
  const { locale, path } = await params;
  if (!isLocalizedLocale(locale)) notFound();

  const pagePath = currentPath(path);
  if (!isSupportedLocalizedPath(pagePath)) notFound();

  const isHome = pagePath === "/";

  return (
    <>
      <LocalizedHeader locale={locale} />
      <main>
        <LocalizedHero locale={locale} path={pagePath} />
        {isHome ? (
          <>
            <ProofSection locale={locale} />
            <ProductCards locale={locale} />
            <ApplicationCards locale={locale} />
            <ContactPanel locale={locale} />
          </>
        ) : pagePath === "/products" ? (
          <ProductCards locale={locale} />
        ) : pagePath === "/applications" ? (
          <ApplicationCards locale={locale} />
        ) : pagePath === "/contact" ? (
          <ContactPanel locale={locale} />
        ) : pagePath === "/about" || pagePath === "/factory" || pagePath === "/testing" || pagePath === "/tools/fire-pump-selector" ? (
          <>
            <ProofSection locale={locale} />
            <ContactPanel locale={locale} />
          </>
        ) : (
          <ResourceCards locale={locale} path={pagePath} />
        )}
      </main>
      <Footer />
      <StickyCta />
    </>
  );
}
