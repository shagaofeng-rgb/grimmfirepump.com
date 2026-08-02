"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { SectionHeading } from "@/components/section-heading";
import { projects } from "@/data/site";

export function ProjectMapSection() {
  const [active, setActive] = useState(0);
  const project = projects[active];

  return (
    <section className="section dark-gradient">
      <SectionHeading
        eyebrow="Project evidence"
        title="Projects shown with real delivery evidence."
        text="Review country, system configuration and project context alongside actual equipment and site photography."
        light
      />
      <div className="container-shell grid gap-7 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="grid gap-2 border-y border-white/15 py-2 lg:py-3">
          {projects.map((item, index) => (
            <button
              key={item.region}
              type="button"
              onClick={() => setActive(index)}
              className={`flex min-h-14 w-full items-center justify-between gap-4 px-4 text-left text-sm font-black transition ${
                active === index ? "bg-white text-[var(--navy-900)]" : "text-white hover:bg-white/10"
              }`}
            >
              <span>{item.region}</span>
              <span className={active === index ? "text-[var(--orange-dark)]" : "text-orange-200"}>{item.meta}</span>
            </button>
          ))}
        </div>
        <article className="overflow-hidden rounded-lg bg-white">
          <div className="relative h-[260px]">
            <Image src={project.image} alt={project.title} fill className="object-cover" />
          </div>
          <div className="p-6">
            <p className="text-sm font-bold text-[var(--orange-dark)]">{project.region}</p>
            <h3 className="text-2xl font-black text-[var(--navy-950)]">{project.title}</h3>
            <p className="mt-4 font-bold text-slate-700">{project.meta}</p>
            <p className="mt-4 text-sm leading-6 text-slate-600">{project.text}</p>
            <Link href="/contact" className="button button-primary mt-5 min-h-11 gap-2">
              Discuss a similar project <ArrowRight size={16} />
            </Link>
          </div>
        </article>
      </div>
    </section>
  );
}
