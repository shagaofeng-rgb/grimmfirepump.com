import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, FileCheck2, Gauge } from "lucide-react";

export function Hero() {
  return (
    <section className="relative isolate min-h-[660px] overflow-hidden bg-[var(--navy-950)] text-white md:min-h-[690px]">
      <Image
        src="/assets/applications/hero-edj.webp"
        alt="GRIMM PUMP EDJ fire pump package in a factory test environment"
        fill
        priority
        className="object-cover object-[68%_center]"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-[rgba(6,21,36,0.64)]" />
      <div className="relative mx-auto flex min-h-[660px] max-w-[1360px] items-center px-5 py-20 md:min-h-[690px] md:px-8 lg:px-12">
        <div className="max-w-[720px]">
          <p className="text-sm font-black text-orange-200">GRIMM PUMP FIRE PUMP SYSTEMS</p>
          <h1 className="mt-5 text-5xl font-black leading-[1.04] md:text-7xl">Engineered fire pump systems for global projects.</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-100 md:text-xl">Complete electric, diesel and jockey pump configurations supported by factory capability, project documentation and direct technical communication.</p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link className="inline-flex min-h-14 items-center justify-center gap-2 bg-[var(--orange)] px-7 text-sm font-black text-white transition hover:bg-[var(--orange-dark)]" href="/contact">Request a Quote <ArrowRight size={17} /></Link>
            <Link className="inline-flex min-h-14 items-center justify-center border border-white/60 bg-white px-7 text-sm font-black text-[var(--navy-950)] transition hover:border-white" href="/downloads">Download Catalog</Link>
          </div>
          <div className="mt-10 grid max-w-[640px] gap-3 sm:grid-cols-3">
            <div className="flex gap-2 border-l border-white/50 pl-3 text-sm font-bold leading-5"><BadgeCheck className="shrink-0 text-orange-200" size={19} />Management-system evidence</div>
            <div className="flex gap-2 border-l border-white/50 pl-3 text-sm font-bold leading-5"><Gauge className="shrink-0 text-orange-200" size={19} />Duty-point review</div>
            <div className="flex gap-2 border-l border-white/50 pl-3 text-sm font-bold leading-5"><FileCheck2 className="shrink-0 text-orange-200" size={19} />Project documentation</div>
          </div>
        </div>
      </div>
    </section>
  );
}
