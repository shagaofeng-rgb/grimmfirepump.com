"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Menu, X } from "lucide-react";
import { company } from "@/data/site";

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
      <div className="container-shell flex h-[72px] items-center justify-between gap-6">
        <Link href="/" className="flex items-center gap-3" aria-label="GRIMM PUMP home">
          <Image src="/assets/images/logo.png" alt="" width={38} height={38} className="brightness-0 invert" priority />
          <span className="text-[15px] font-black tracking-[0.08em] text-white md:text-base">{company.shortName}</span>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex" aria-label="Primary navigation">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="home-nav-link">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link href="#project-brief" data-event="project_brief_click" className="home-header-cta hidden sm:inline-flex">
            Send project brief
            <ArrowRight size={16} />
          </Link>
          <button
            type="button"
            className="grid h-11 w-11 place-items-center border border-white/20 text-white lg:hidden"
            aria-label={open ? "Close navigation" : "Open navigation"}
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
      </div>

      {open ? (
        <nav className="border-t border-white/10 bg-[var(--navy-950)] px-5 py-5 lg:hidden" aria-label="Mobile navigation">
          <div className="mx-auto grid max-w-[1240px] gap-1">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="border-b border-white/10 py-4 font-bold text-white"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Link href="#project-brief" data-event="project_brief_click" className="home-header-cta mt-4" onClick={() => setOpen(false)}>
              Send project brief
              <ArrowRight size={16} />
            </Link>
          </div>
        </nav>
      ) : null}
    </header>
  );
}
