import Image from "next/image";
import Link from "next/link";

export function Hero() {
  return (
    <section className="container-shell grid items-center gap-12 py-14 md:py-20 lg:min-h-[690px] lg:grid-cols-[0.9fr_1.1fr]">
      <div>
        <p className="eyebrow mb-4">Flame Primes Fire Pump Systems</p>
        <h1 className="max-w-3xl text-[40px] font-black leading-[1.04] tracking-normal text-[var(--navy-950)] md:text-[58px]">
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
        <dl className="mt-8 hidden max-w-2xl grid-cols-3 gap-4 md:grid">
          {[
            ["50-2500", "GPM packaged range"],
            ["6-13", "bar EDJ configurations"],
            ["16", "bar max working pressure"],
          ].map(([value, label]) => (
            <div key={value} className="rounded-lg border border-slate-200 bg-white p-4">
              <dt className="text-2xl font-black text-[var(--navy-900)]">{value}</dt>
              <dd className="mt-2 text-sm text-slate-600">{label}</dd>
            </div>
          ))}
        </dl>
      </div>
      <div className="industrial-shadow relative min-h-[340px] overflow-hidden rounded-lg bg-[var(--navy-900)] md:min-h-[500px]">
        <Image
          src="/assets/applications/hero-edj.webp"
          alt="Flame Primes EDJ fire fighting pump system installed in a pump room"
          fill
          priority
          className="object-cover"
          sizes="(min-width: 1024px) 54vw, 100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[rgba(7,20,38,0.56)] to-transparent" />
        <div className="absolute bottom-6 right-6 max-w-[310px] rounded-lg border border-white/15 bg-[rgba(7,20,38,0.82)] p-5 text-white">
          <strong className="block">Factory assembled</strong>
          <span className="mt-1 block text-sm text-slate-200">Electric + diesel + jockey pump package</span>
        </div>
      </div>
    </section>
  );
}
