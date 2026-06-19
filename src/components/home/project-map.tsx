"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { SectionHeading } from "@/components/section-heading";
import { projects } from "@/data/site";

const pinClasses = ["left-[53%] top-[38%]", "left-[69%] top-[54%]", "left-[32%] top-[66%]", "left-[51%] top-[61%]"];

export function ProjectMapSection() {
  const [active, setActive] = useState(0);
  const project = projects[active];

  return (
    <section className="section dark-gradient">
      <SectionHeading
        eyebrow="Global Project System"
        title="Show projects as proof, not country lists."
        text="Use real site photos, product models, country and project background to turn every case into a trust asset."
        light
      />
      <div className="container-shell grid gap-7 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="relative min-h-[390px] overflow-hidden rounded-lg border border-white/10 bg-[#102743]">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[length:48px_48px]" />
          <div className="absolute left-7 top-6 text-xs font-black uppercase tracking-[0.12em] text-white/80">Interactive Project Map</div>
          {projects.map((item, index) => (
            <button
              key={item.region}
              type="button"
              onClick={() => setActive(index)}
              className={`absolute min-h-9 min-w-[116px] rounded-full px-3 text-xs font-black ${pinClasses[index]} ${
                active === index ? "bg-white text-[var(--navy-900)]" : "bg-[var(--orange)] text-white"
              }`}
            >
              {item.region}
            </button>
          ))}
        </div>
        <article className="overflow-hidden rounded-lg bg-white">
          <div className="relative h-[230px]">
            <Image src={project.image} alt={project.title} fill className="object-cover" />
          </div>
          <div className="p-6">
            <p className="eyebrow mb-3">{project.region}</p>
            <h3 className="text-2xl font-black text-[var(--navy-950)]">{project.title}</h3>
            <p className="mt-4 font-bold text-slate-700">{project.meta}</p>
            <p className="mt-4 text-sm leading-6 text-slate-600">{project.text}</p>
            <Link href="/contact" className="button button-primary mt-5 min-h-11">
              Discuss Similar Project
            </Link>
          </div>
        </article>
      </div>
    </section>
  );
}
