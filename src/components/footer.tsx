import Image from "next/image";
import Link from "next/link";
import { company, footerColumns } from "@/data/site";
import { SocialAccountLink } from "@/components/social-accounts";

export function FooterSocialLinks({ className = "", placement = "footer_social" }: { className?: string; placement?: string } = {}) {
  const linkClass = "grid size-11 shrink-0 place-items-center rounded-full bg-white transition-shadow hover:ring-2 hover:ring-white/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

  return (
    <div className={`flex flex-wrap items-center gap-2.5 ${className}`}>
      <SocialAccountLink platform="facebook" className={linkClass} iconSize={24} />
      <SocialAccountLink platform="youtube" className={linkClass} iconSize={24} />
      <SocialAccountLink platform="whatsapp" className={linkClass} iconSize={24} placement={placement} />
    </div>
  );
}

export function Footer({ interior = false }: { interior?: boolean } = {}) {
  const footerLinks: Record<string, string> = {
    "EDJ Fire Pump System": "/products/edj-fire-pump-set",
    "Electric Fire Pump": "/products/2-electric-plus-jockey-pump-set",
    "Diesel Fire Pump": "/products/diesel-engine-fire-pump",
    "Jockey Pump": "/products/vertical-stainless-steel-multistage-pump-jockey-pump",
    "Factory Strength": "/factory",
    "Testing Capability": "/testing",
    "Certificates": "/certificates",
    "Project Cases": "/projects",
    "Download Catalog": "/downloads",
    "Industry News": "/news",
    "Knowledge Center": "/knowledge",
    "Fire Pump Selector": "/tools/fire-pump-selector",
    "Contact Sales": "/contact",
  };

  return (
    <footer className={`bg-[var(--navy-950)] px-6 pb-20 pt-14 text-slate-300 ${interior ? "interior-footer" : ""}`}>
      <div className="mx-auto grid max-w-[1240px] gap-10 md:grid-cols-[1.35fr_repeat(3,1fr)]">
        <div>
          <Link href="/" className="mb-5 flex items-center gap-3">
            <Image src="/assets/images/logo.png" alt={`${company.shortName} logo`} width={42} height={42} className="invert" />
            <span className="flex flex-col leading-none">
              <strong className="text-base text-white">{company.shortName}</strong>
              <small className="mt-1 text-xs text-slate-400">Fire Pump Systems</small>
            </span>
          </Link>
          <p className="max-w-sm text-sm leading-7">
            Factory-built fire pump systems for project buyers who need technical evidence before shipment.
          </p>
          <p className="mt-5 text-sm leading-7">{company.legalName}</p>
          <p className="mt-2 text-sm leading-7">{company.address}</p>
          <div className="mt-4 grid gap-2 text-sm">
            <a className="hover:text-white" href={`mailto:${company.email}`}>{company.email}</a>
            <span>{company.phone}</span>
          </div>
          <FooterSocialLinks className="mt-5" />
        </div>
        {footerColumns.map((column) => (
          <div key={column.title}>
            {interior ? <p className="mb-4 font-bold text-white">{column.title}</p> : <h3 className="mb-4 font-bold text-white">{column.title}</h3>}
            <div className="grid gap-2 text-sm">
              {column.items.map((item) => (
                <Link key={item} href={footerLinks[item] || "/contact"} className="hover:text-white">
                  {item}
                </Link>
              ))}
              {interior && column.items.includes("Industry News") && <Link href="/blog" prefetch={false} className="hover:text-white">Blog</Link>}
            </div>
          </div>
        ))}
      </div>
      <div className="mx-auto mt-10 flex max-w-[1240px] flex-wrap gap-5 border-t border-white/15 pt-6 text-xs">
        <Link href="/privacy" className="hover:text-white">Privacy Policy</Link>
        <Link href="/terms" className="hover:text-white">Terms of Use</Link>
        <Link href="/sitemap.xml" className="hover:text-white">Site Map</Link>
      </div>
    </footer>
  );
}
