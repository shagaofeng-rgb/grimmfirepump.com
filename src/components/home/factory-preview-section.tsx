import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const items = [
  {
    title: "Precision Manufacturing",
    image: "/assets/factory/real/production-capacity.webp",
  },
  {
    title: "Rigorous Testing",
    image: "/assets/factory/factory-testing.webp",
  },
  {
    title: "Global Delivery",
    image: "/assets/factory/factory-warehouse.webp",
  },
];

export function FactoryPreviewSection() {
  return (
    <section className="home-practical">
      <Image src="/assets/factory/factory-assembly.webp" alt="GRIMM PUMP factory floor" fill className="home-factory-background" sizes="100vw" />
      <div className="home-section-inner home-factory-layout">
        <div className="home-factory-copy">
          <p>REAL PROJECTS. REAL IMPACT.</p>
          <h2>From Our Factory<br />to the World</h2>
          <span>Trusted by contractors, consultants and end users across industries. Our fire pump systems are operating in commercial buildings, industrial facilities, infrastructure and more — helping to protect lives and assets worldwide.</span>
          <Link href="/factory">View Our Projects <ArrowRight size={17} /></Link>
        </div>
        <div className="home-practical-grid">
          {items.map(({ title, image }) => (
            <article key={title}>
              <Image src={image} alt={title} fill className="object-cover" sizes="(min-width: 1024px) 22vw, 80vw" />
              <h3>{title}</h3>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
