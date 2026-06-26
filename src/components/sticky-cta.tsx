import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { company } from "@/data/site";

export function StickyCta() {
  return (
    <div className="fixed right-4 bottom-4 z-40 flex flex-col items-end gap-3 md:right-6 md:bottom-6">
      <a
        className="inline-flex min-h-12 items-center gap-2 rounded-full border border-emerald-100 bg-white px-4 text-sm font-black text-emerald-700 shadow-[0_16px_40px_rgba(7,20,38,0.18)] transition hover:-translate-y-0.5 hover:text-emerald-800"
        href={company.whatsappUrl}
        target="_blank"
        rel="noreferrer"
        data-event="whatsapp_click"
      >
        <span className="grid h-8 w-8 place-items-center rounded-full bg-emerald-500 text-white">
          <MessageCircle size={18} />
        </span>
        WhatsApp me
      </a>
      <Link className="button button-primary hidden min-h-11 px-5 text-sm shadow-[0_14px_35px_rgba(242,140,40,0.25)] md:inline-flex" href="/contact">
        Get Quote
      </Link>
    </div>
  );
}
