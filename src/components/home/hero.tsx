import Image from "next/image";
import Link from "next/link";
import { ArrowRight, FileCheck2, MessageSquareText, Settings2 } from "lucide-react";

const proofPoints = [
  { title: "Project-fit configuration", Icon: Settings2 },
  { title: "Clear technical inputs", Icon: FileCheck2 },
  { title: "Direct engineering contact", Icon: MessageSquareText },
];

export function Hero() {
  return (
    <section className="home-hero">
      <div className="container-shell grid min-h-[650px] items-stretch lg:grid-cols-[0.92fr_1.08fr]">
        <div className="flex flex-col justify-center py-16 pr-0 lg:py-24 lg:pr-12">
          <p className="home-kicker">Fire pump systems for global projects</p>
          <h1 className="home-display mt-5 max-w-[720px] text-[46px] leading-[0.98] text-white sm:text-[58px] lg:text-[68px]">
            Specify the pump system before it delays the build.
          </h1>
          <p className="mt-7 max-w-xl text-base leading-8 text-slate-300 md:text-lg">
            Fire pump packages shaped around your duty, water source and project documentation needs.
          </p>
          <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center">
            <Link className="button home-button-primary" href="/contact">
              Request technical review
            </Link>
            <Link className="home-text-link" href="/products">
              Explore pump systems
              <ArrowRight size={18} />
            </Link>
          </div>

          <div className="mt-12 grid gap-3 border-t border-white/10 pt-7 sm:grid-cols-3">
            {proofPoints.map(({ title, Icon }) => (
              <div key={title} className="flex items-center gap-3 text-xs font-bold leading-5 text-slate-200">
                <Icon size={20} className="shrink-0 text-[var(--orange)]" />
                <span>{title}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="home-hero-media relative min-h-[400px] overflow-hidden lg:min-h-[650px]">
          <Image
            src="/assets/applications/hero-edj.webp"
            alt="GRIMM PUMP EDJ fire pump package in a pump room"
            fill
            priority
            className="object-cover"
            sizes="(min-width: 1024px) 54vw, 100vw"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,20,38,0.72)_0%,rgba(7,20,38,0.08)_38%,rgba(7,20,38,0.08)_100%)]" />
          <div className="absolute bottom-6 left-6 border-l-2 border-[var(--orange)] bg-[rgba(7,20,38,0.88)] px-4 py-3 text-white">
            <span className="block text-xs font-bold uppercase tracking-[0.16em] text-orange-200">System focus</span>
            <strong className="mt-1 block text-sm">Electric + diesel + jockey pump package</strong>
          </div>
        </div>
      </div>
    </section>
  );
}
