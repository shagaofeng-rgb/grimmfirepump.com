import Image from "next/image";
import Link from "next/link";
import { company, footerColumns } from "@/data/site";
import { FacebookIcon, WhatsAppIcon, YouTubeIcon } from "@/components/social-platform-icons";

export function Footer() {
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
    <footer className="bg-[var(--navy-950)] px-6 pb-20 pt-14 text-slate-300">
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
          <div className="mt-5 flex items-center gap-3">
            <a className="grid h-9 w-9 place-items-center rounded-full border border-white/25 text-white transition hover:-translate-y-0.5 hover:border-white hover:bg-white hover:text-[#1877f2] focus:outline-none focus:ring-2 focus:ring-white/70" href={company.facebookUrl} target="_blank" rel="noreferrer" data-event="facebook_click" aria-label="Follow GRIMM PUMP on Facebook" title="Facebook">
              <FacebookIcon className="h-4 w-4" />
            </a>
            <a className="grid h-9 w-9 place-items-center rounded-full border border-white/25 text-white transition hover:-translate-y-0.5 hover:border-white hover:bg-white hover:text-[#ff0000] focus:outline-none focus:ring-2 focus:ring-white/70" href={company.youtubeUrl} target="_blank" rel="noreferrer" data-event="youtube_click" aria-label="Watch GRIMM PUMP on YouTube" title="YouTube">
              <YouTubeIcon className="h-4 w-4" />
            </a>
            <a className="grid h-9 w-9 place-items-center rounded-full border border-white/25 text-white transition hover:-translate-y-0.5 hover:border-white hover:bg-white hover:text-[#25d366] focus:outline-none focus:ring-2 focus:ring-white/70" href={company.whatsappUrl} target="_blank" rel="noreferrer" data-event="whatsapp_click" data-whatsapp-account="grimm-main" data-whatsapp-placement="footer_social" aria-label="Contact GRIMM PUMP on WhatsApp" title="WhatsApp">
              <WhatsAppIcon className="h-4 w-4" />
            </a>
          </div>
        </div>
        {footerColumns.map((column) => (
          <div key={column.title}>
            <h3 className="mb-4 font-bold text-white">{column.title}</h3>
            <div className="grid gap-2 text-sm">
              {column.items.map((item) => (
                <Link key={item} href={footerLinks[item] || "/contact"} className="hover:text-white">
                  {item}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </footer>
  );
}
