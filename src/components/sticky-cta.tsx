import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { company } from "@/data/site";

export function StickyCta() {
  return (
    <div className="fixed right-4 bottom-4 z-40 flex flex-col items-end gap-3 md:right-6 md:bottom-6">
      <a
        className="inline-flex min-h-12 items-center gap-2 rounded-full border border-emerald-100 bg-white px-2 text-sm font-black text-emerald-700 shadow-[0_16px_40px_rgba(7,20,38,0.18)] transition hover:-translate-y-0.5 hover:text-emerald-800 md:px-2 2xl:px-4"
        href={company.whatsappUrl}
        target="_blank"
        rel="noreferrer"
        data-event="whatsapp_click"
        aria-label="Contact us on WhatsApp"
      >
        <span className="grid h-8 w-8 place-items-center rounded-full bg-emerald-500 text-white">
          <MessageCircle size={18} />
        </span>
        <span className="hidden 2xl:inline">WhatsApp me</span>
      </a>
      <Link
        className="hidden min-h-11 items-center justify-center rounded-md bg-[var(--orange)] px-5 text-sm font-extrabold text-white shadow-[0_14px_35px_rgba(242,140,40,0.25)] transition hover:-translate-y-0.5 hover:bg-[var(--orange-dark)] 2xl:inline-flex"
        href="/contact"
      >
        Get Quote
      </Link>
    </div>
  );
}
