"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, Search, X } from "lucide-react";
import { productMegaMenuGroups } from "@/data/site";

const nav = [
  { label: "Home", href: "/" },
  { label: "Products", href: "/products" },
  { label: "Solutions", href: "/applications" },
  { label: "Quality", href: "#certifications" },
  { label: "Projects", href: "/projects" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export function HomeHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const [mobileProductsOpen, setMobileProductsOpen] = useState(false);
  const productMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const closeOnOutsidePress = (event: PointerEvent) => {
      if (!productMenuRef.current?.contains(event.target as Node)) {
        setProductsOpen(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setProductsOpen(false);
        setOpen(false);
        setMobileProductsOpen(false);
      }
    };

    document.addEventListener("pointerdown", closeOnOutsidePress);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsidePress);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  useEffect(() => {
    setProductsOpen(false);
    setOpen(false);
    setMobileProductsOpen(false);
  }, [pathname]);

  const closeMobileMenu = () => {
    setOpen(false);
    setMobileProductsOpen(false);
  };

  return (
    <header className="home-header">
      <div className="home-header-inner">
        <Link href="/" className="home-wordmark" aria-label="GRIMM PUMP home">
          <span>GRIMM<span>PUMP</span></span>
          <small>PUMPING A SAFER TOMORROW</small>
        </Link>

        <nav className="home-desktop-nav" aria-label="Primary navigation">
          {nav.map((item) => item.label === "Products" ? (
            <div
              key={item.href}
              ref={productMenuRef}
              className="home-products-menu"
              onMouseEnter={() => setProductsOpen(true)}
              onMouseLeave={() => setProductsOpen(false)}
              onFocusCapture={() => setProductsOpen(true)}
            >
              <Link href={item.href} className="home-products-label">Products</Link>
              <button
                type="button"
                className="home-products-toggle"
                aria-label="Open product categories"
                aria-expanded={productsOpen}
                aria-controls="home-product-navigation"
                onClick={() => setProductsOpen((value) => !value)}
              >
                <ChevronDown size={13} aria-hidden="true" />
              </button>
              <HomeProductFlyout open={productsOpen} close={() => setProductsOpen(false)} />
            </div>
          ) : <Link key={item.href} href={item.href}>{item.label}</Link>)}
        </nav>

        <div className="home-header-actions">
          <Link href="/contact" className="home-header-cta">Get a Quote <span aria-hidden="true">→</span></Link>
          <Link href="/search" className="home-search-link" aria-label="Search"><Search size={18} /></Link>
          <Link href="/" className="home-language-link" aria-label="English language site">EN <ChevronDown size={13} /></Link>
        </div>

        <button
          type="button"
          className="home-menu-button"
          aria-label={open ? "Close navigation" : "Open navigation"}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X size={25} /> : <Menu size={25} />}
        </button>
      </div>

      {open ? (
        <nav className="home-mobile-nav" aria-label="Mobile navigation">
          {nav.map((item) => item.label === "Products" ? (
            <div className="home-mobile-products" key={item.href}>
              <button
                type="button"
                aria-expanded={mobileProductsOpen}
                onClick={() => setMobileProductsOpen((value) => !value)}
              >
                Products
                <ChevronDown size={17} className={mobileProductsOpen ? "is-open" : ""} aria-hidden="true" />
              </button>
              {mobileProductsOpen ? <HomeMobileProductMenu close={closeMobileMenu} /> : null}
            </div>
          ) : (
            <Link key={item.href} href={item.href} onClick={closeMobileMenu}>{item.label}</Link>
          ))}
          <Link href="/contact" className="home-mobile-nav-cta" onClick={closeMobileMenu}>Send project brief</Link>
        </nav>
      ) : null}
    </header>
  );
}

function HomeProductFlyout({ open, close }: { open: boolean; close: () => void }) {
  return (
    <section
      id="home-product-navigation"
      className={`home-product-flyout ${open ? "is-open" : ""}`}
      aria-label="Product categories"
    >
      <div className="home-product-flyout-intro">
        <p>PRODUCT NAVIGATION</p>
        <h2>Find the right pump package for your project.</h2>
        <span>Browse by system type, water application and duty requirement.</span>
        <Link href="/products" onClick={close}>Explore all products <b aria-hidden="true">→</b></Link>
      </div>
      <div className="home-product-flyout-groups">
        {productMegaMenuGroups.map((group) => (
          <article key={group.slug}>
            <Link href={group.href} className="home-product-group-image" onClick={close} tabIndex={open ? 0 : -1}>
              <Image src={group.image} alt="" fill sizes="150px" className="object-contain" />
            </Link>
            <Link href={group.href} className="home-product-group-title" onClick={close} tabIndex={open ? 0 : -1}>{group.title}</Link>
            <ul>
              {group.items.slice(0, 3).map((product) => (
                <li key={product.href}>
                  <Link href={product.href} onClick={close} tabIndex={open ? 0 : -1}>{product.title}</Link>
                </li>
              ))}
            </ul>
            <Link href={group.href} className="home-product-group-more" onClick={close} tabIndex={open ? 0 : -1}>View category <b aria-hidden="true">→</b></Link>
          </article>
        ))}
      </div>
    </section>
  );
}

function HomeMobileProductMenu({ close }: { close: () => void }) {
  return (
    <div className="home-mobile-product-panel">
      <Link href="/products" className="home-mobile-all-products" onClick={close}>View all products <span aria-hidden="true">→</span></Link>
      {productMegaMenuGroups.map((group) => (
        <section key={group.slug}>
          <Link href={group.href} onClick={close}>{group.title}<span aria-hidden="true">→</span></Link>
          {group.items.slice(0, 3).map((product) => (
            <Link key={product.href} href={product.href} onClick={close}>{product.title}</Link>
          ))}
        </section>
      ))}
    </div>
  );
}

