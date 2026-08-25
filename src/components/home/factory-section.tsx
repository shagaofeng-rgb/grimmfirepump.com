import Image from "next/image";
import { SectionHeading } from "@/components/section-heading";
import { factoryImages } from "@/data/site";

export function FactorySection() {
  return (
    <section className="section">
      <SectionHeading
        eyebrow="Factory Capability"
        title="Real production evidence for project buyers."
        text="From machining and control-cabinet assembly to pump, vessel and integrated-station preparation, the gallery shows the manufacturing environment behind GRIMM project equipment."
      />
      <div className="container-shell grid auto-rows-[220px] gap-4 md:grid-cols-[1.15fr_0.85fr_0.85fr]">
        {factoryImages.map((item) => (
          <figure key={item.src} className={`group relative m-0 overflow-hidden rounded-lg bg-slate-100 ${item.wide ? "md:row-span-2" : ""}`}>
            <Image
              src={item.src}
              alt={item.title}
              fill
              priority={item.wide}
              className="object-cover transition duration-500 motion-safe:group-hover:scale-[1.02]"
              sizes="(min-width: 1024px) 38vw, (min-width: 768px) 50vw, 100vw"
            />
            <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[rgba(7,20,38,0.92)] via-[rgba(7,20,38,0.58)] to-transparent px-5 pb-5 pt-12 text-white">
              <strong className="block text-base leading-6">{item.title}</strong>
              <span className="mt-1 block max-w-md text-sm leading-5 text-slate-200">{item.text}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
