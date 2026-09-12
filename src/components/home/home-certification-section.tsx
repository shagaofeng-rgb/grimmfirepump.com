"use client";

import Image from "next/image";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { certificates } from "@/data/site";

const homepageCertificates = [
  certificates[1],
  certificates[2],
  certificates[3],
  certificates[0],
];

const galleryPositions = [
  "md:translate-y-12 md:rotate-[-3deg]",
  "md:translate-y-4 md:rotate-[-1deg]",
  "md:-translate-y-2 md:rotate-[1deg]",
  "md:translate-y-10 md:rotate-[3deg]",
];

export function HomeCertificationSection() {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const selected = selectedIndex === null ? null : homepageCertificates[selectedIndex];

  useEffect(() => {
    if (selectedIndex === null) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedIndex(null);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [selectedIndex]);

  return (
    <section className="overflow-hidden bg-[var(--navy-950)] py-14 md:py-20" aria-label="Certificates">
      <div className="mx-auto max-w-[1240px] px-5 md:px-8">
        <div className="relative isolate border-y border-white/15 py-6 md:py-10">
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-[15%] top-0 h-px bg-white/50" />
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-[8%] bottom-0 h-12 bg-white/5 blur-3xl" />
          <div className="relative flex snap-x snap-mandatory gap-4 overflow-x-auto px-1 py-6 pb-8 [scrollbar-width:none] md:grid md:grid-cols-4 md:items-end md:gap-6 md:overflow-visible md:px-8 md:py-7">
            {homepageCertificates.map((certificate, index) => (
              <button
                key={certificate.title}
                type="button"
                onClick={() => setSelectedIndex(index)}
                className={`group relative min-w-[72%] snap-center overflow-hidden border border-white/30 bg-white p-2 text-left shadow-[0_20px_45px_rgba(0,0,0,0.42)] outline-none transition duration-500 focus-visible:ring-2 focus-visible:ring-[var(--orange)] focus-visible:ring-offset-4 focus-visible:ring-offset-[var(--navy-950)] hover:z-10 hover:-translate-y-3 hover:rotate-0 hover:border-white md:min-w-0 ${galleryPositions[index]}`}
                aria-label={`Enlarge ${certificate.title} certificate`}
              >
                <div className="relative aspect-[0.707/1] overflow-hidden bg-slate-100">
                  <Image
                    src={certificate.src}
                    alt={`${certificate.title} certificate`}
                    fill
                    className="object-contain transition duration-700 group-hover:scale-[1.025]"
                    sizes="(min-width: 768px) 260px, 72vw"
                  />
                  <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-10 bg-white/20 opacity-0 blur-xl transition duration-500 group-hover:opacity-100" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {selected ? (
        <div className="fixed inset-0 z-[100] grid place-items-center bg-black/80 p-5 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={`${selected.title} certificate`} onClick={() => setSelectedIndex(null)}>
          <div className="relative max-h-[92vh] max-w-4xl" onClick={(event) => event.stopPropagation()}>
            <button
              type="button"
              onClick={() => setSelectedIndex(null)}
              className="absolute -right-2 -top-2 z-10 grid h-11 w-11 place-items-center rounded-full border border-white/30 bg-[var(--navy-950)] text-white shadow-lg transition hover:bg-[var(--orange)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              aria-label="Close certificate preview"
            >
              <X size={20} />
            </button>
            <div className="relative max-h-[88vh] overflow-auto border border-white/30 bg-white p-2 shadow-2xl">
              <Image src={selected.src} alt={`${selected.title} certificate`} width={900} height={1273} className="h-auto max-h-[86vh] w-auto max-w-full object-contain" priority />
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
