import Image from "next/image";
import Link from "next/link";
import { SectionHeading } from "@/components/section-heading";

const images = [
  { src: "/assets/factory/factory-assembly.webp", title: "Pump assembly workshop" },
  { src: "/assets/factory/factory-machining.webp", title: "Machining capability" },
  { src: "/assets/factory/factory-warehouse.webp", title: "Parts and inventory" },
];

export function FactoryPreviewSection() {
  return (
    <section className="section">
      <SectionHeading
        eyebrow="Factory Strength"
        title="Real manufacturing capacity behind every pump package."
        text="Use the factory page for full production, testing, certificate and video proof. The homepage only shows enough evidence to build confidence quickly."
        action={<Link className="button button-secondary min-h-11" href="/factory">View Factory</Link>}
      />
      <div className="container-shell grid gap-5 md:grid-cols-3">
        {images.map((image) => (
          <figure key={image.src} className="relative m-0 h-[230px] overflow-hidden rounded-lg bg-slate-100 md:h-[280px]">
            <Image src={image.src} alt={image.title} fill loading="eager" className="object-cover" sizes="(min-width: 768px) 33vw, 100vw" />
            <figcaption className="absolute bottom-4 left-4 rounded-md bg-[rgba(7,20,38,0.78)] px-3 py-2 text-sm font-bold text-white">
              {image.title}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
