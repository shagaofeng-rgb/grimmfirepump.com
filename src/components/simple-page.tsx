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
        <section className="dark-gradient px-6 py-24">
          <div className="mx-auto max-w-[1200px]">
            <p className="eyebrow mb-4">{eyebrow}</p>
            <h1 className="max-w-4xl text-5xl font-black leading-tight text-white md:text-6xl">{title}</h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">{text}</p>
            <div className="mt-8 flex flex-wrap gap-4">
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
