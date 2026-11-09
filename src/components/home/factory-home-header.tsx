"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronDown, Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { ProductNavigationGroup } from "@/lib/product-navigation";

const resources = [
  { title: "Product catalog & documents", href: "/downloads" },
  { title: "Certificates", href: "/certificates" },
  { title: "Testing & quality", href: "/testing" },
  { title: "News", href: "/news" },
  { title: "Technical knowledge", href: "/knowledge" },
  { title: "Blog", href: "/blog" },
];

export function FactoryHomeHeader({ groups }: { groups: ProductNavigationGroup[] }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [active, setActive] = useState<"products" | "resources" | null>(null);
  const header = useRef<HTMLElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const productToggle = useRef<HTMLButtonElement>(null);
  const resourceToggle = useRef<HTMLButtonElement>(null);

  function close() { setActive(null); setMobileOpen(false); }

  useEffect(() => {
    if (!mobileOpen && !active) return;
    function outside(event: PointerEvent) {
      if (!header.current?.contains(event.target as Node)) close();
    }
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, [mobileOpen, active]);

  useEffect(() => {
    if (!mobileOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const desktop = window.matchMedia("(min-width: 1000px)");
    const resize = () => { if (desktop.matches) close(); };
    desktop.addEventListener("change", resize);
    return () => { document.body.style.overflow = original; desktop.removeEventListener("change", resize); };
  }, [mobileOpen]);

  return (
    <header className="factory-header" ref={header} onKeyDown={(event) => {
      if (event.key === "Escape") {
        if (active) {
          (active === "products" ? productToggle : resourceToggle).current?.focus();
          setActive(null);
        } else if (mobileOpen) { close(); toggle.current?.focus(); }
      }
      if (event.key === "Tab" && mobileOpen) {
        const focusable = Array.from(header.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])') || []).filter((el) => el.getClientRects().length);
        const first = focusable[0], last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    }}>
      <a className="factory-skip-link" href="#factory-main">Skip to content</a>
      <div className="factory-container factory-header-inner">
        <Link className="factory-brand" href="/" aria-label="GRIMM PUMP home" onClick={close}>
          <Image src="/assets/images/logo.png" alt="" width={40} height={40} priority />
          <span><strong>GRIMM PUMP</strong><small>Fire Pump Systems</small></span>
        </Link>
        <button className="factory-mobile-toggle" ref={toggle} type="button" aria-label={mobileOpen ? "Close navigation" : "Open navigation"} aria-expanded={mobileOpen} aria-controls="factory-navigation" onClick={() => { setMobileOpen((value) => !value); setActive(null); }}>
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <nav className={`factory-navigation${mobileOpen ? " is-open" : ""}`} id="factory-navigation" aria-label="Main navigation" onClick={(event) => { if ((event.target as Element).closest("a")) close(); }}>
          <div className="factory-nav-disclosure" onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node) && !mobileOpen) setActive(null); }}>
            <button ref={productToggle} type="button" className="factory-nav-button" aria-expanded={active === "products"} aria-controls="factory-product-menu" onClick={() => setActive((value) => value === "products" ? null : "products")}>
              Products <ChevronDown size={15} aria-hidden="true" />
            </button>
            {active === "products" && <div className="factory-product-menu" id="factory-product-menu">
              <div className="factory-menu-heading"><strong>Pumping systems</strong><Link href="/products">All products <ArrowRight size={16} /></Link></div>
              <div className="factory-menu-grid">{groups.map((group) => <div key={group.slug} className="factory-menu-group"><Link href={group.href} className="factory-menu-category">{group.title}<ArrowRight size={15} /></Link>{group.items.slice(0, 3).map((item) => <Link key={item.href} href={item.href}>{item.title}</Link>)}</div>)}</div>
            </div>}
          </div>
          <Link className="factory-nav-link" href="/factory">Manufacturing</Link>
          <Link className="factory-nav-link" href="/applications">Applications</Link>
          <div className="factory-nav-disclosure factory-resource-disclosure" onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node) && !mobileOpen) setActive(null); }}>
            <button ref={resourceToggle} type="button" className="factory-nav-button" aria-expanded={active === "resources"} aria-controls="factory-resource-menu" onClick={() => setActive((value) => value === "resources" ? null : "resources")}>
              Resources <ChevronDown size={15} aria-hidden="true" />
            </button>
            {active === "resources" && <div id="factory-resource-menu" className="factory-resource-menu">{resources.map((item) => <Link key={item.href} href={item.href}>{item.title}<ArrowRight size={15} /></Link>)}</div>}
          </div>
          <Link className="factory-nav-link" href="/about">About</Link>
          <Link className="factory-button factory-header-quote" href="/contact" data-event="quote_click" data-label="Homepage navigation">Request a Quote</Link>
        </nav>
      </div>
    </header>
  );
}
