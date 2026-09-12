import Image from "next/image";

const markets = ["Middle East", "Southeast Asia", "Europe", "Africa", "South America"];

export function HomeGlobalCoverage() {
  return (
    <section className="bg-slate-50 py-14 md:py-20">
      <div className="mx-auto max-w-[1240px] px-5 md:px-8">
        <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <p className="text-sm font-black text-[var(--orange-dark)]">GLOBAL MARKET COVERAGE</p>
            <h2 className="mt-3 text-3xl font-black leading-tight text-[var(--navy-950)] md:text-5xl">Support for cross-border project conversations.</h2>
          </div>
          <p className="max-w-xs text-sm leading-6 text-slate-600">Coverage markers show priority markets for communication and project support. They do not represent individual project sites.</p>
        </div>
        <div className="mt-9 overflow-hidden rounded-lg border border-slate-200 bg-white">
          <div className="relative aspect-[16/9] min-h-[230px]">
            <Image src="/assets/coverage/global-market-coverage-map.png" alt="GRIMM PUMP priority market coverage map" fill className="object-cover" sizes="(min-width: 1280px) 1240px, 100vw" />
          </div>
          <div className="flex flex-wrap gap-2 border-t border-slate-200 p-5">
            {markets.map((market) => <span key={market} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-black text-[var(--navy-900)]">{market}</span>)}
          </div>
        </div>
      </div>
    </section>
  );
}
