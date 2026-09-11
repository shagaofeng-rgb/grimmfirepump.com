"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, Search, X } from "lucide-react";

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
  const [open, setOpen] = useState(false);

  return (
    <header className="home-header">
      <div className="home-header-inner">
        <Link href="/" className="home-wordmark" aria-label="GRIMM PUMP home">
          <span>GRIMM<span>PUMP</span></span>
          <small>PUMPING A SAFER TOMORROW</small>
        </Link>

        <nav className="home-desktop-nav" aria-label="Primary navigation">
          {nav.map((item) => <Link key={item.href} href={item.href}>{item.label}</Link>)}
        </nav>

        <div className="home-header-actions">
          <Link href="/contact" className="home-header-cta">Get a Quote <span aria-hidden="true">→</span></Link>
          <Link href="/search" className="home-search-link" aria-label="Search"><Search size={18} /></Link>
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
          {nav.map((item) => (
            <Link key={item.href} href={item.href} onClick={() => setOpen(false)}>{item.label}</Link>
          ))}
          <Link href="/contact" className="home-mobile-nav-cta" onClick={() => setOpen(false)}>Send project brief</Link>
        </nav>
      ) : null}
    </header>
  );
}
