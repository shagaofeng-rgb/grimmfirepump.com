import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Cog, UsersRound } from "lucide-react";

const proofPoints = [
  { title: "Reliable Performance\nin Critical Moments", Icon: BadgeCheck },
  { title: "Engineered for\nGlobal Standards", Icon: Cog },
  { title: "A Trusted Partner\nin Fire Protection", Icon: UsersRound },
];

function ProofRail({ mobile = false }: { mobile?: boolean }) {
  return (
    <div className={mobile ? "home-proof-rail home-proof-mobile" : "home-proof-rail home-proof-desktop"}>
      {proofPoints.map(({ title, Icon }) => (
        <div key={title} className="home-proof-item">
          <Icon size={25} strokeWidth={1.45} />
          <span>{title.split("\n").map((line) => <span key={line}>{line}</span>)}</span>
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
          <p className="home-hero-kicker">FIRE PUMP SYSTEMS. FOR A SAFER TOMORROW.</p>
          <h1>Engineered<br />Fire Protection<br /><em>Without Compromise</em></h1>
          <p>GRIMM PUMP designs and manufactures reliable fire pump systems for commercial, industrial and infrastructure projects worldwide. Built to perform. Certified for confidence.</p>
          <div className="home-hero-actions">
            <Link className="home-primary-button" href="/products">Explore Our Products <ArrowRight size={18} /></Link>
            <Link className="home-secondary-link" href="/contact">Contact Our Team</Link>
          </div>
          <ProofRail />
        </div>

        <div className="home-hero-image">
          <Image
            src="/assets/applications/hero-edj.webp"
            alt="GRIMM PUMP fire pump package in a pump room"
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
