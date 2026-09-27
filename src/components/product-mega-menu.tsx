"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { productMegaMenuGroups } from "@/data/site";

export function ProductMegaMenu() {
  return (
    <div className="fixed left-1/2 top-[72px] z-50 max-h-[calc(100vh-88px)] w-[min(1160px,calc(100vw-48px))] -translate-x-1/2 overflow-y-auto pt-3">
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_30px_80px_rgba(7,20,38,0.18)]">
        <div className="grid grid-cols-[260px_1fr]">
          <div className="bg-[var(--navy-950)] p-6 text-white">
            <h2 className="text-2xl font-black leading-tight">Pump systems organized for project buyers.</h2>
            <p className="mt-3 text-sm font-bold text-orange-200">Product categories</p>
            <p className="mt-4 text-sm leading-6 text-white/72">
              Browse by system type, application condition and buying scenario.
            </p>
            <Link className="mt-7 inline-flex items-center gap-2 text-sm font-black text-[var(--orange)]" href="/products">
              View all products
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid gap-0 divide-x divide-y divide-slate-100 lg:grid-cols-3 xl:grid-cols-5 xl:divide-y-0">
            {productMegaMenuGroups.map((group) => (
              <section key={group.title} className="flex min-h-[340px] flex-col p-4">
                <Link href={group.href} className="group/card block">
                  <figure className="relative mb-4 h-28 overflow-hidden rounded-md bg-slate-50">
                    <Image
                      src={group.image}
                      alt={group.title}
                      fill
                      className="object-contain p-3 transition duration-300 group-hover/card:scale-[1.04]"
                      sizes="220px"
                    />
                  </figure>
                  <h3 className="text-[15px] font-black leading-snug text-[var(--navy-950)]">{group.title}</h3>
                  <p className="mt-2 min-h-[60px] text-xs leading-5 text-slate-500">{group.description}</p>
                </Link>

                <div className="mt-4 grid gap-2">
                  {group.items.slice(0, 5).map((product) => (
                    <Link
                      key={product.href}
                      href={product.href}
                      className="flex items-start gap-2 rounded-md px-2 py-2 text-xs font-bold leading-5 text-slate-700 hover:bg-slate-50 hover:text-[var(--navy-800)]"
                    >
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--orange)]" />
                      <span>{product.title}</span>
                    </Link>
                  ))}
                </div>
                <Link href={group.href} className="mt-auto inline-flex items-center gap-1 pt-4 text-xs font-black text-[var(--orange)] hover:text-[var(--orange-dark)]">
                  More
                  <ArrowRight size={14} />
                </Link>
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
