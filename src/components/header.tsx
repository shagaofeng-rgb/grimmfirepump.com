"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu, MessageCircle, X } from "lucide-react";
import { useState } from "react";
import { company, navItems } from "@/data/site";

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/92 backdrop-blur-xl">
      <div className="mx-auto flex h-[76px] max-w-[1280px] items-center justify-between gap-6 px-6">
        <Link href="/" className="flex min-w-[220px] items-center gap-3" aria-label={`${company.shortName} Fire Pump home`}>
          <Image src="/assets/images/logo.png" alt={`${company.shortName} logo`} width={42} height={42} className="object-contain" />
          <span className="flex flex-col leading-none">
            <strong className="text-base tracking-[0.04em] text-[var(--navy-900)]">{company.shortName}</strong>
            <small className="mt-1 text-xs text-slate-500">Fire Pump Systems</small>
          </span>
        </Link>

        <nav className="hidden items-center gap-4 text-[13px] font-bold text-slate-700 xl:gap-6 xl:text-sm lg:flex" aria-label="Primary">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="border-b-2 border-transparent py-7 hover:border-[var(--orange)]">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a
            className="hidden items-center gap-2 text-sm font-extrabold text-[var(--navy-800)] md:flex"
            href={company.whatsappUrl}
            target="_blank"
            rel="noreferrer"
            data-event="whatsapp_click"
          >
            <MessageCircle size={18} />
            WhatsApp
          </a>
          <Link className="button button-primary mobile-header-quote min-h-[42px] px-4 text-sm" href="/contact">
            Get Quote
          </Link>
          <button
            className="grid h-11 w-11 place-items-center rounded-md border border-slate-200 lg:hidden"
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-label="Open menu"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {open ? (
        <nav className="grid border-t border-slate-100 bg-white px-6 pb-5 shadow-xl lg:hidden" aria-label="Mobile">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="border-b border-slate-100 py-4 font-bold" onClick={() => setOpen(false)}>
              {item.label}
            </Link>
          ))}
          <Link className="button button-primary mt-5" href="/contact" onClick={() => setOpen(false)}>
            Get Quote
          </Link>
        </nav>
      ) : null}
    </header>
  );
}
