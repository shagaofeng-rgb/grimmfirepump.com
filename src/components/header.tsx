"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronDown, Menu, MessageCircle, X } from "lucide-react";
import { useState } from "react";
import { company, navItems, productMegaMenuGroups } from "@/data/site";

export function Header() {
  const [open, setOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const [mobileProductsOpen, setMobileProductsOpen] = useState(true);

  const closeMobileMenu = () => {
    setOpen(false);
    setMobileProductsOpen(true);
  };

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

        <nav className="hidden items-center gap-3 text-[13px] font-bold text-slate-700 xl:gap-5 xl:text-sm lg:flex" aria-label="Primary">
          {navItems.map((item) =>
            item.label === "Products" ? (
              <div
                key={item.href}
                className="group"
                onMouseEnter={() => setProductsOpen(true)}
                onMouseLeave={() => setProductsOpen(false)}
                onFocus={() => setProductsOpen(true)}
              >
                <Link
                  href={item.href}
                  className="flex items-center gap-1 border-b-2 border-transparent py-7 hover:border-[var(--orange)]"
                >
                  {item.label}
                  <ChevronDown size={15} className={`transition ${productsOpen ? "rotate-180" : ""}`} />
                </Link>
                <ProductMegaMenu open={productsOpen} />
              </div>
            ) : (
              <Link key={item.href} href={item.href} className="border-b-2 border-transparent py-7 hover:border-[var(--orange)]">
                {item.label}
              </Link>
            )
          )}
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
        <nav className="max-h-[calc(100vh-76px)] overflow-y-auto border-t border-slate-100 bg-white px-5 pb-5 shadow-xl lg:hidden" aria-label="Mobile">
          {navItems.map((item) =>
            item.label === "Products" ? (
              <div key={item.href} className="border-b border-slate-100">
                <button
                  className="flex w-full items-center justify-between py-4 text-left font-black text-[var(--navy-950)]"
                  type="button"
                  onClick={() => setMobileProductsOpen((value) => !value)}
                  aria-expanded={mobileProductsOpen}
                >
                  Products
                  <ChevronDown size={18} className={`transition ${mobileProductsOpen ? "rotate-180" : ""}`} />
                </button>
                {mobileProductsOpen ? <MobileProductMenu closeMenu={closeMobileMenu} /> : null}
              </div>
            ) : (
              <Link key={item.href} href={item.href} className="block border-b border-slate-100 py-4 font-bold" onClick={closeMobileMenu}>
                {item.label}
              </Link>
            )
          )}
          <Link className="button button-primary mt-5 w-full" href="/contact" onClick={closeMobileMenu}>
            Get Quote
          </Link>
        </nav>
      ) : null}
    </header>
  );
}

function ProductMegaMenu({ open }: { open: boolean }) {
  return (
    <div
      className={`fixed left-1/2 top-[76px] z-50 max-h-[calc(100vh-92px)] w-[min(1160px,calc(100vw-48px))] -translate-x-1/2 overflow-y-auto pt-3 transition duration-150 ${
        open ? "visible opacity-100" : "invisible pointer-events-none opacity-0"
      }`}
    >
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_30px_80px_rgba(7,20,38,0.18)]">
        <div className="grid grid-cols-[260px_1fr]">
          <div className="bg-[var(--navy-950)] p-6 text-white">
            <p className="eyebrow">Product Categories</p>
            <h2 className="mt-3 text-2xl font-black leading-tight">Pump systems organized for project buyers.</h2>
            <p className="mt-4 text-sm leading-6 text-white/72">
              Browse by system type, application condition and buying scenario.
            </p>
            <Link
              className="mt-7 inline-flex items-center gap-2 text-sm font-black text-[var(--orange)]"
              href="/products"
            >
              View all products
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid gap-0 divide-x divide-y divide-slate-100 lg:grid-cols-3 xl:grid-cols-5 xl:divide-y-0">
            {productMegaMenuGroups.map((group) => (
              <section key={group.title} className="flex min-h-[340px] flex-col p-4">
                <Link href={group.href} className="group/card block">
                  <figure className="relative mb-4 h-28 overflow-hidden rounded-md bg-slate-50">
                    <Image
                      src={group.image}
                      alt={group.title}
                      fill
                      className="object-contain p-3 transition duration-300 group-hover/card:scale-[1.04]"
                      loading="eager"
                      sizes="220px"
                    />
                  </figure>
                  <h3 className="text-[15px] font-black leading-snug text-[var(--navy-950)]">{group.title}</h3>
                  <p className="mt-2 min-h-[60px] text-xs leading-5 text-slate-500">{group.description}</p>
                </Link>

                <div className="mt-4 grid gap-2">
                  {group.items.slice(0, 5).map((product) => (
                    <Link
                      key={product.href}
                      href={product.href}
                      className="flex items-start gap-2 rounded-md px-2 py-2 text-xs font-bold leading-5 text-slate-700 hover:bg-slate-50 hover:text-[var(--navy-800)]"
                    >
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--orange)]" />
                      <span>{product.title}</span>
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function MobileProductMenu({ closeMenu }: { closeMenu: () => void }) {
  return (
    <div className="grid gap-4 pb-5">
      <Link className="rounded-md bg-slate-50 px-4 py-3 text-sm font-black text-[var(--navy-900)]" href="/products" onClick={closeMenu}>
        All Products
      </Link>
      {productMegaMenuGroups.map((group) => (
        <section key={group.title} className="rounded-md border border-slate-100 bg-white p-3">
          <Link className="flex items-center gap-3" href={group.href} onClick={closeMenu}>
            <span className="relative h-14 w-16 shrink-0 overflow-hidden rounded bg-slate-50">
              <Image src={group.image} alt={group.title} fill className="object-contain p-1.5" loading="eager" sizes="64px" />
            </span>
            <span>
              <strong className="block text-sm text-[var(--navy-950)]">{group.title}</strong>
              <span className="mt-1 block text-xs leading-5 text-slate-500">{group.description}</span>
            </span>
          </Link>
          <div className="mt-3 grid gap-2 border-t border-slate-100 pt-3">
            {group.items.slice(0, 4).map((product) => (
              <Link key={product.href} className="text-sm font-bold leading-6 text-slate-700" href={product.href} onClick={closeMenu}>
                {product.title}
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
