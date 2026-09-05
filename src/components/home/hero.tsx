import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CircleGauge, Headset, Settings2 } from "lucide-react";

const proofPoints = [
  { title: "Project-fit configuration", Icon: Settings2 },
  { title: "Clear technical inputs", Icon: CircleGauge },
  { title: "Direct engineering contact", Icon: Headset },
];

function ProofRail({ mobile = false }: { mobile?: boolean }) {
  return (
    <div className={mobile ? "home-proof-rail home-proof-mobile" : "home-proof-rail home-proof-desktop"}>
      {proofPoints.map(({ title, Icon }) => (
        <div key={title} className="home-proof-item">
          <Icon size={25} strokeWidth={1.45} />
          <span>{title}</span>
        </div>
      ))}
    </div>
  );
}

export function Hero() {
  return (
    <section className="home-hero">
      <div className="home-hero-inner">
        <div className="home-hero-copy">
          <h1>Specify the pump system before it delays the build.</h1>
          <p>Fire pump packages shaped around your duty, water source and project documentation needs.</p>
          <div className="home-hero-actions">
            <Link className="home-primary-button" href="/contact">Request technical review</Link>
            <Link className="home-secondary-link" href="/products">Explore pump systems <ArrowRight size={18} /></Link>
          </div>
          <ProofRail />
        </div>

        <div className="home-hero-image">
          <Image
            src="/assets/applications/hero-edj.webp"
            alt="GRIMM PUMP EDJ fire pump package in a pump room"
            fill
            priority
            className="object-cover"
            sizes="(min-width: 1024px) 54vw, 100vw"
          />
        </div>
        <ProofRail mobile />
      </div>
    </section>
  );
}
