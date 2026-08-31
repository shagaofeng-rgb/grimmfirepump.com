import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Menu } from "lucide-react";
import { StickyCta } from "@/components/sticky-cta";
import { applications, certificates, company, downloads, knowledgePosts, products, projects } from "@/data/site";
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
import { getPublicPosts } from "@/lib/public-cms";

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
        <a className="button button-primary hidden min-h-[42px] px-4 text-sm sm:inline-flex" href={company.whatsappUrl} target="_blank" rel="noreferrer">
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
            <a className="button button-primary mt-2 min-h-[42px] text-sm sm:hidden" href={company.whatsappUrl} target="_blank" rel="noreferrer">
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

function LocalizedFooter({ locale }: { locale: LocalizedLocale }) {
  const content = localizedSite[locale];
  const navPaths: LocalizedPath[] = ["/products", "/applications", "/projects", "/factory", "/downloads", "/contact"];
  return (
    <footer className="bg-[var(--navy-950)] px-6 pb-20 pt-14 text-slate-300" lang={content.htmlLang} dir={content.dir}>
      <div className="mx-auto grid max-w-[1240px] gap-10 md:grid-cols-[1.2fr_0.8fr]">
        <div>
          <Link href={localizedPath("/", locale)} className="flex items-center gap-3">
            <Image src="/assets/images/logo.png" alt={`${company.shortName} logo`} width={42} height={42} className="invert" />
            <strong className="text-white">{company.shortName}</strong>
          </Link>
          <p className="mt-5 max-w-xl text-sm leading-7">{content.home.text}</p>
          <p className="mt-4 text-sm leading-7">{company.legalName}</p>
          <a className="mt-2 block text-sm hover:text-white" href={`mailto:${company.email}`}>{company.email}</a>
        </div>
        <nav className="grid grid-cols-2 gap-3 text-sm font-bold" aria-label={`${content.localeName} footer navigation`}>
          {navPaths.map((path) => <Link key={path} href={localizedPath(path, locale)} className="hover:text-white">{content.nav[path]}</Link>)}
        </nav>
      </div>
    </footer>
  );
}

async function ResourceCards({ locale, path }: { locale: LocalizedLocale; path: LocalizedPath }) {
  const content = localizedSite[locale];
  const blogPosts = path === "/blog" ? await getPublicPosts() : [];
  const cards =
    path === "/projects"
      ? projects.map((item) => ({ title: item.title, text: `${item.region} · ${item.meta}`, image: item.image, href: "/projects" }))
      : path === "/downloads"
        ? downloads.map((item) => ({ title: item.title, text: item.text, image: "/assets/applications/hero-edj.webp", href: "/downloads" }))
        : path === "/certificates"
          ? certificates.map((item) => ({ title: item.title, text: item.note, image: item.src, href: "/certificates" }))
          : path === "/blog"
            ? blogPosts.slice(0, 6).map((item) => ({ title: item.title, text: item.text, image: item.image, href: `/${locale}/blog/${item.slug}` }))
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
            <LocalizedHomeLinks locale={locale} />
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
      <LocalizedFooter locale={locale} />
      <StickyCta />
    </>
  );
}
