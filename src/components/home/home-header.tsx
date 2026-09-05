"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const nav = [
  { label: "Products", href: "/products" },
  { label: "Applications", href: "/applications" },
  { label: "Project support", href: "/testing" },
  { label: "Resources", href: "/downloads" },
];

export function HomeHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="home-header">
      <div className="home-header-inner">
        <Link href="/" className="home-wordmark" aria-label="GRIMM PUMP home">GRIMM PUMP</Link>

        <nav className="home-desktop-nav" aria-label="Primary navigation">
          {nav.map((item) => <Link key={item.href} href={item.href}>{item.label}</Link>)}
        </nav>

        <Link href="/contact" className="home-header-cta">Send project brief</Link>

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
