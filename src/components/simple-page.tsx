import type { ReactNode } from "react";
import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { StickyCta } from "@/components/sticky-cta";

type SimplePageProps = {
  eyebrow: string;
  title: string;
  text: string;
  children: ReactNode;
};

export function SimplePage({ eyebrow, title, text, children }: SimplePageProps) {
  return (
    <>
      <Header />
      <main>
        <section className="dark-gradient border-b border-white/10 px-6 py-16 md:py-20">
          <div className="mx-auto max-w-[1240px]">
            <p className="text-sm font-bold text-orange-200">{eyebrow}</p>
            <h1 className="mt-3 max-w-4xl text-[38px] font-black leading-[1.08] text-white md:text-[56px]">{title}</h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-slate-300 md:text-lg">{text}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link className="button button-primary" href="/contact">Get Quote</Link>
              <Link className="button button-secondary" href="/downloads">Download Catalog</Link>
            </div>
          </div>
        </section>
        {children}
      </main>
      <Footer />
      <StickyCta />
    </>
  );
}
