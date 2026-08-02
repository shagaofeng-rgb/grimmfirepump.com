import Image from "next/image";
import Link from "next/link";
import { Check } from "lucide-react";
import { company } from "@/data/site";

export function Hero() {
  return (
    <section className="container-shell grid items-center gap-10 py-12 md:py-16 lg:min-h-[590px] lg:grid-cols-[0.9fr_1.1fr] lg:py-20">
      <div>
        <p className="text-sm font-bold text-[var(--orange-dark)]">{company.name}</p>
        <h1 className="mt-3 max-w-3xl text-[40px] font-black leading-[1.04] text-[var(--navy-950)] md:text-[58px]">
          Fire Pump Packages for Global Projects
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
          Factory-built diesel, electric and jockey fire pump packages with technical data, testing evidence, downloads
          and fast engineering support for EPC buyers.
        </p>
        <div className="mt-8 flex flex-col gap-4 sm:flex-row">
          <Link className="button button-primary" href="/contact">
            Get a Quote
          </Link>
          <Link className="button button-secondary" href="/downloads">
            Download Catalog
          </Link>
        </div>
        <ul className="mt-8 grid gap-3 text-sm font-bold text-slate-700 sm:grid-cols-3">
          {["Factory-assembled packages", "Buyer-ready documents", "Fast engineering response"].map((item) => (
            <li key={item} className="flex items-start gap-2"><Check className="mt-0.5 shrink-0 text-[var(--orange)]" size={17} />{item}</li>
          ))}
        </ul>
      </div>
      <div className="industrial-shadow relative min-h-[330px] overflow-hidden rounded-lg bg-[var(--navy-900)] md:min-h-[470px]">
        <Image
          src="/assets/applications/hero-edj.webp"
          alt={`${company.shortName} EDJ fire fighting pump system installed in a pump room`}
          fill
          priority
          className="object-cover"
          sizes="(min-width: 1024px) 54vw, 100vw"
        />
        <div className="absolute inset-0 bg-[rgba(7,20,38,0.22)]" />
        <div className="absolute bottom-5 left-5 max-w-[310px] border border-white/15 bg-[rgba(7,20,38,0.88)] px-4 py-3 text-white">
          <strong className="block">Factory assembled</strong>
          <span className="mt-1 block text-sm text-slate-200">Electric + diesel + jockey pump package</span>
        </div>
      </div>
    </section>
  );
}
