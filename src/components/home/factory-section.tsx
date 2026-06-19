import Image from "next/image";
import { SectionHeading } from "@/components/section-heading";
import { factoryImages } from "@/data/site";

export function FactorySection() {
  return (
    <section className="section">
      <SectionHeading
        eyebrow="Factory Capability"
        title="Manufacturing, assembly, testing and documentation in one story."
        text="The factory section reassures EPC buyers that GRIMM can manufacture packaged pump systems, handle testing and prepare export-ready documentation."
      />
      <div className="container-shell grid auto-rows-[220px] gap-4 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
        {factoryImages.map((item) => (
          <figure key={item.src} className={`relative m-0 overflow-hidden rounded-lg bg-slate-100 ${item.wide ? "md:row-span-2" : ""}`}>
            <Image src={item.src} alt={item.title} fill loading="eager" className="object-cover" sizes="(min-width: 1024px) 40vw, 100vw" />
            <figcaption className="absolute bottom-4 left-4 rounded-md bg-[rgba(7,20,38,0.76)] px-3 py-2 font-bold text-white">
              {item.title}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
