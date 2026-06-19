import Link from "next/link";
import { company } from "@/data/site";

export function StickyCta() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-3 bg-[var(--navy-950)] text-sm font-extrabold text-white md:inset-auto md:right-5 md:bottom-5 md:w-[120px] md:grid-cols-1 md:gap-2 md:bg-transparent">
      <Link className="grid min-h-11 place-items-center bg-[var(--orange)] md:rounded-md" href="/contact">
        Get Quote
      </Link>
      <a
        className="grid min-h-11 place-items-center border-x border-white/10 bg-[var(--navy-900)] md:rounded-md md:border-0"
        href={company.whatsappUrl}
        target="_blank"
        rel="noreferrer"
        data-event="whatsapp_click"
      >
        WhatsApp
      </a>
      <Link className="grid min-h-11 place-items-center bg-[var(--navy-900)] md:rounded-md" href="/downloads">
        Catalog
      </Link>
    </div>
  );
}
