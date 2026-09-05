import Link from "next/link";
import { ArrowRight, Droplets, Gauge, Waves, Zap } from "lucide-react";

const inputs = [
  { title: "Flow", text: "Required fire-water demand", Icon: Waves },
  { title: "Head", text: "Required pressure or total head", Icon: Gauge },
  { title: "Power", text: "Electric supply or diesel drive", Icon: Zap },
  { title: "Water source", text: "Tank, reservoir or supply condition", Icon: Droplets },
];

export function AdvantageSection() {
  return (
    <section className="home-inputs-section">
      <div className="container-shell py-16 md:py-20">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="home-kicker">Start with the project</p>
            <h2 className="home-display mt-3 max-w-3xl text-3xl leading-tight text-white md:text-[44px]">
              The inputs that shape the package.
            </h2>
          </div>
          <Link href="/tools/fire-pump-selector" className="home-text-link">
            Use fire pump selector
            <ArrowRight size={18} />
          </Link>
        </div>

        <div className="mt-10 grid gap-px overflow-hidden border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
          {inputs.map(({ title, text, Icon }) => (
            <article key={title} className="min-h-[190px] bg-[var(--navy-900)] p-6 md:p-7">
              <Icon size={28} strokeWidth={1.6} className="text-[var(--orange)]" />
              <h3 className="mt-8 text-xl font-black text-white">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">{text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
