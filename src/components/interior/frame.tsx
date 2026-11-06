import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, ChevronDown, ChevronRight, Globe2, Mail, Menu, Search } from "lucide-react";
import { Footer } from "@/components/footer";
import { StickyCta } from "@/components/sticky-cta";
import { company } from "@/data/site";
import { localizedSite } from "@/data/localized-site";
import { getPublicProductNavigation } from "@/lib/public-cms";
import { isSupportedLocalizedPath, localizedPath, type SiteLocale } from "@/lib/i18n";
import { InteriorDisclosure } from "./disclosure";
import "./interior.css";

type Crumb = { label: string; href?: string };

const primary = [
  ["Applications", "/applications"],
  ["Projects", "/projects"],
  ["Factory", "/factory"],
] as const;
const resources = [
  ["Download center", "/downloads"],
  ["Certificates", "/certificates"],
  ["Testing", "/testing"],
  ["Knowledge center", "/knowledge"],
  ["Technical blog", "/blog"],
  ["Industry news", "/news"],
  ["Fire pump selector", "/tools/fire-pump-selector"],
] as const;
const languages = [
  ["English", "en", "EN"], ["Español", "es", "ES"], ["Русский", "ru", "RU"],
  ["العربية", "ar", "AR"], ["Français", "fr", "FR"], ["Português", "pt", "PT"],
] as const;

function languageTarget(path: string, locale: SiteLocale) {
  const root = `/${path.split("/")[1]}`;
  const target = locale === "en" || isSupportedLocalizedPath(path) || path.startsWith("/blog/") ? path : isSupportedLocalizedPath(root) ? root : "/";
  return localizedPath(target, locale);
}

const localeUi = {
  en: { resources: "Resources", quote: "Request a quote", language: "Select language", menu: "Navigation menu", skip: "Skip to content" },
  es: { resources: "Recursos", quote: "Solicitar cotización", language: "Seleccionar idioma", menu: "Menú de navegación", skip: "Ir al contenido" },
  ru: { resources: "Ресурсы", quote: "Запросить цену", language: "Выбрать язык", menu: "Меню навигации", skip: "К содержанию" },
  ar: { resources: "الموارد", quote: "طلب عرض سعر", language: "اختيار اللغة", menu: "قائمة التنقل", skip: "انتقل إلى المحتوى" },
  fr: { resources: "Ressources", quote: "Demander un devis", language: "Choisir la langue", menu: "Menu de navigation", skip: "Aller au contenu" },
  pt: { resources: "Recursos", quote: "Solicitar cotação", language: "Selecionar idioma", menu: "Menu de navegação", skip: "Ir ao conteúdo" },
};

async function InteriorHeader({ path, productMenu, locale }: { path: string; productMenu: boolean; locale: SiteLocale }) {
  const groups = productMenu && locale === "en" ? await getPublicProductNavigation() : [];
  const copy = locale === "en" ? undefined : localizedSite[locale];
  const ui = localeUi[locale];
  const active = (href: string) => path === href || path.startsWith(`${href}/`);
  const navLink = ([label, href]: readonly [string, string]) => (
    <Link key={href} href={languageTarget(href, locale)} prefetch={false} aria-current={active(href) ? "page" : undefined}>
      {label === "Request a quote" ? ui.quote : isSupportedLocalizedPath(href) ? copy?.nav[href] || label : label}
    </Link>
  );

  return (
    <header className="interior-header">
      <div className="interior-utility">
        <div className="interior-shell">
          <span className="interior-utility-name">GRIMM WATER TREATMENT</span>
          <div className="interior-utility-links">
            <a className="interior-sales" href={`mailto:${company.email}`}><Mail size={14} /> {copy?.labels.contactSales || "Engineering sales"}</a>
            <InteriorDisclosure className="interior-language" label={ui.language} icon={<><Globe2 size={15} /> {locale.toUpperCase()}</>}>
              <nav className="interior-dropdown" aria-label="Languages">
                {languages.map(([label, language, code]) => (
                  <Link key={language} href={languageTarget(path, language)} prefetch={false} hrefLang={language} lang={language} aria-current={locale === language ? "true" : undefined}>{label}<small>{code}</small></Link>
                ))}
              </nav>
            </InteriorDisclosure>
          </div>
        </div>
      </div>
      <div className="interior-header-bar interior-shell">
        <Link href={localizedPath("/", locale)} className="interior-brand" aria-label="GRIMM PUMP" prefetch={false}>
          <Image src="/assets/images/logo.png" alt="" width={38} height={38} />
          <span><strong>{company.shortName}</strong><small>Fire Pump Systems</small></span>
        </Link>
        <nav className="interior-desktop-nav" aria-label="Primary">
          <div className="interior-nav-group" data-active={active("/products")}>
            {navLink(["Products", "/products"])}
            {groups.length > 0 && (
              <InteriorDisclosure className="interior-nav-toggle" label="Product families" icon={<ChevronDown size={15} />}>
                <nav className="interior-dropdown interior-product-menu" aria-label="Product families">
                  {groups.map((group) => <Link key={group.slug} href={group.href} prefetch={false}>{group.title}<ChevronRight size={15} /></Link>)}
                </nav>
              </InteriorDisclosure>
            )}
          </div>
          {primary.map(navLink)}
          <InteriorDisclosure className="interior-nav-group" label={ui.resources} icon={<><span>{ui.resources}</span><ChevronDown size={14} /></>}>
            <nav className="interior-dropdown" aria-label={ui.resources}>{resources.map(navLink)}</nav>
          </InteriorDisclosure>
          {navLink(["About", "/about"])}
        </nav>
        <div className="interior-header-actions">
          <Link className="interior-icon-button" href={localizedPath("/search", locale)} aria-label={copy?.nav["/search"] || "Search"} title={copy?.nav["/search"] || "Search"} prefetch={false}><Search size={19} /></Link>
          <Link className="interior-button interior-primary interior-header-quote" href={localizedPath("/contact", locale)} prefetch={false}>{ui.quote} <ArrowRight size={16} /></Link>
          <InteriorDisclosure className="interior-mobile-menu" label={ui.menu} icon={<Menu size={22} />}>
            <nav className="interior-mobile-links" aria-label={ui.menu}>
              {navLink(["Products", "/products"])}
              {groups.length > 0 && <details><summary>Product families <ChevronDown size={16} /></summary><div>{groups.map((group) => <Link key={group.slug} href={group.href} prefetch={false}>{group.title}</Link>)}</div></details>}
              {primary.map(navLink)}
              <details><summary>{ui.resources} <ChevronDown size={16} /></summary><div>{resources.map(navLink)}</div></details>
              {navLink(["About", "/about"])}
              {navLink(["Request a quote", "/contact"])}
            </nav>
          </InteriorDisclosure>
        </div>
      </div>
    </header>
  );
}

export function InteriorFrame({
  path,
  breadcrumbs,
  children,
  productMenu = true,
  footer,
  locale = "en",
}: {
  path: string;
  breadcrumbs?: Crumb[];
  children: ReactNode;
  productMenu?: boolean;
  footer?: ReactNode;
  locale?: SiteLocale;
}) {
  return (
    <div className="interior-site" data-interior-locale={locale}>
      <a href="#interior-main" className="interior-skip">{localeUi[locale].skip}</a>
      <InteriorHeader path={path} productMenu={productMenu} locale={locale} />
      {breadcrumbs?.length ? <InteriorBreadcrumbs items={breadcrumbs} locale={locale} /> : null}
      <main id="interior-main" className="interior-main" tabIndex={-1}>{children}</main>
      {footer ?? <Footer interior />}
      <StickyCta />
    </div>
  );
}

function InteriorBreadcrumbs({ items, locale }: { items: Crumb[]; locale: SiteLocale }) {
  return (
    <nav className="interior-breadcrumbs" aria-label="Breadcrumb">
      <ol className="interior-shell">
        <li><Link href={localizedPath("/", locale)} prefetch={false}>{locale === "en" ? "Home" : localizedSite[locale].nav["/"]}</Link></li>
        {items.map(({ label, href }, index) => (
          <li key={`${label}-${index}`}>
            <ChevronRight size={12} aria-hidden="true" />
            {href ? <Link href={href} prefetch={false}>{label}</Link> : <span aria-current="page">{label}</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function PageMast({ eyebrow, title, text, image, action }: {
  eyebrow?: string; title: string; text?: string; image?: { src: string; alt: string }; action?: ReactNode;
}) {
  return (
    <section className={image ? "interior-mast interior-photo-mast" : "interior-mast"}>
      {image && <Image src={image.src} alt={image.alt} fill sizes="100vw" priority />}
      <div className="interior-shell interior-mast-inner">
        <div>
          {eyebrow && <p className="interior-kicker">{eyebrow}</p>}
          <h1>{title}</h1>
          {text && <p className="interior-deck">{text}</p>}
        </div>
        {action && <div className="interior-mast-action">{action}</div>}
      </div>
    </section>
  );
}

export function SectionHeading({ eyebrow, title, action }: { eyebrow?: string; title: string; action?: ReactNode }) {
  return (
    <div className="interior-section-heading">
      <div>{eyebrow && <p className="interior-kicker">{eyebrow}</p>}<h2>{title}</h2></div>
      {action}
    </div>
  );
}

export function InteriorTabs({ links, label, keepScroll = true }: {
  links: { label: string; href: string; current: boolean; icon?: ReactNode }[];
  label: string;
  keepScroll?: boolean;
}) {
  return (
    <nav className="interior-tabs" aria-label={label}>
      {links.map((link) => (
        <Link key={link.href} href={link.href} scroll={!keepScroll} prefetch={false} aria-current={link.current ? "page" : undefined}>
          {link.icon}<span>{link.label}</span>
        </Link>
      ))}
    </nav>
  );
}
