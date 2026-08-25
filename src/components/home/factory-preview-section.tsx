import Image from "next/image";
import Link from "next/link";
import { SectionHeading } from "@/components/section-heading";

const images = [
  { src: "/assets/factory/real/production-capacity.jpg", title: "Production capacity" },
  { src: "/assets/factory/real/cnc-machining.jpg", title: "CNC machining" },
  { src: "/assets/factory/real/controller-assembly.jpg", title: "Controller assembly" },
];

export function FactoryPreviewSection() {
  return (
    <section className="section">
      <SectionHeading
        eyebrow="Factory Strength"
        title="Real manufacturing evidence behind every project package."
        text="A focused look at production scale, pump-component machining and control-cabinet assembly."
        action={<Link className="button button-secondary min-h-11" href="/factory">View Factory</Link>}
      />
      <div className="container-shell grid gap-4 md:grid-cols-3">
        {images.map((image) => (
          <figure key={image.src} className="relative m-0 h-[220px] overflow-hidden rounded-lg bg-slate-100 md:h-[260px]">
            <Image src={image.src} alt={image.title} fill loading="lazy" className="object-cover" sizes="(min-width: 768px) 33vw, 100vw" />
            <figcaption className="absolute bottom-4 left-4 bg-[rgba(7,20,38,0.84)] px-3 py-2 text-sm font-bold text-white">
              {image.title}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
