"use client";

import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowRight, ChevronDown, Menu, MessageCircle, X } from "lucide-react";
import { useState } from "react";
import { company, navItems, productMegaMenuGroups } from "@/data/site";

const ProductMegaMenu = dynamic(
  () => import("@/components/product-mega-menu").then((module) => module.ProductMegaMenu),
  { ssr: false },
);

export function Header() {
  const [open, setOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const [mobileProductsOpen, setMobileProductsOpen] = useState(false);
  const desktopNavItems = navItems.filter((item) => ["About", "Products", "Applications", "Projects", "Factory"].includes(item.label));
  const resourceItems = navItems.filter((item) => ["Testing", "Downloads", "News", "Knowledge", "Search"].includes(item.label));

  const closeMobileMenu = () => {
    setOpen(false);
    setMobileProductsOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] max-w-[1280px] items-center justify-between gap-5 px-5 md:px-6">
        <Link href="/" className="flex min-w-0 items-center gap-3" aria-label={`${company.shortName} Fire Pump home`}>
          <Image src="/assets/images/logo.png" alt={`${company.shortName} logo`} width={42} height={42} className="object-contain" />
          <span className="flex flex-col leading-none">
            <strong className="text-base text-[var(--navy-900)]">{company.shortName}</strong>
            <small className="mt-1 text-xs text-slate-500">Fire Pump Systems</small>
          </span>
        </Link>

        <nav className="hidden items-center gap-4 text-[13px] font-bold text-slate-700 xl:flex 2xl:gap-5 2xl:text-sm" aria-label="Primary">
          {desktopNavItems.map((item) =>
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
                  className="flex items-center gap-1 border-b-2 border-transparent py-[25px] hover:border-[var(--orange)]"
                >
                  {item.label}
                  <ChevronDown size={15} className={`transition ${productsOpen ? "rotate-180" : ""}`} />
                </Link>
                {productsOpen ? <ProductMegaMenu /> : null}
              </div>
            ) : (
              <Link key={item.href} href={item.href} className="border-b-2 border-transparent py-[25px] hover:border-[var(--orange)]">
                {item.label}
              </Link>
            )
          )}
          <div
            className="group relative"
            onMouseEnter={() => setResourcesOpen(true)}
            onMouseLeave={() => setResourcesOpen(false)}
            onFocus={() => setResourcesOpen(true)}
          >
            <button
              className="flex items-center gap-1 border-b-2 border-transparent py-[25px] font-bold hover:border-[var(--orange)]"
              type="button"
              aria-expanded={resourcesOpen}
            >
              Resources
              <ChevronDown size={15} className={`transition ${resourcesOpen ? "rotate-180" : ""}`} />
            </button>
            <div className={`absolute right-0 top-[64px] w-56 rounded-md border border-slate-200 bg-white p-2 shadow-[0_18px_36px_rgba(7,20,38,0.12)] transition ${resourcesOpen ? "visible opacity-100" : "invisible pointer-events-none opacity-0"}`}>
              {resourceItems.map((item) => (
                <Link key={item.href} href={item.href} className="block rounded px-3 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-[var(--navy-900)]">
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </nav>

        <div className="flex items-center gap-3">
          <a
            className="hidden items-center gap-2 text-sm font-extrabold text-[var(--navy-800)] md:flex"
            href={company.whatsappUrl}
            target="_blank"
            rel="noreferrer"
            data-event="whatsapp_click"
            data-whatsapp-account="grimm-main"
            data-whatsapp-placement="header"
          >
            <MessageCircle size={18} />
            WhatsApp
          </a>
          <Link className="button button-primary mobile-header-quote min-h-[42px] px-4 text-sm" href="/contact">
            Get Quote
          </Link>
          <button
            className="grid h-11 w-11 place-items-center rounded-md border border-slate-200 xl:hidden"
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-label="Open menu"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {open ? (
        <nav className="max-h-[calc(100vh-72px)] overflow-y-auto border-t border-slate-100 bg-white px-5 pb-5 shadow-xl xl:hidden" aria-label="Mobile">
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
              <Image src={group.image} alt={group.title} fill className="object-contain p-1.5" sizes="64px" />
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
          <Link className="mt-3 inline-flex items-center gap-1 text-xs font-black text-[var(--orange)]" href={group.href} onClick={closeMenu}>
            More
            <ArrowRight size={14} />
          </Link>
        </section>
      ))}
    </div>
  );
}
