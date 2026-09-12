import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Boxes, ClipboardCheck, Cog, PackageCheck } from "lucide-react";

const capabilities = [
  { label: "Component machining", Icon: Cog },
  { label: "System assembly", Icon: Boxes },
  { label: "Inspection and checks", Icon: ClipboardCheck },
  { label: "Shipment preparation", Icon: PackageCheck },
];

export function HomeFactoryCapability() {
  return (
    <section className="bg-[var(--navy-950)] py-14 text-white md:py-20">
      <div className="mx-auto grid max-w-[1240px] gap-10 px-5 md:px-8 lg:grid-cols-[1.04fr_0.96fr] lg:items-center">
        <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-white/15">
          <Image src="/assets/factory/real/production-capacity.webp" alt="GRIMM PUMP production capacity and component staging" fill className="object-cover" sizes="(min-width: 1024px) 48vw, 92vw" />
        </div>
        <div>
          <p className="text-sm font-black text-orange-300">FACTORY & QUALITY REVIEW</p>
          <h2 className="mt-3 text-3xl font-black leading-tight md:text-5xl">Real manufacturing evidence, organized for project teams.</h2>
          <p className="mt-5 max-w-xl text-base leading-7 text-slate-300">Review published factory capability, assembly areas and equipment preparation before requesting project documentation.</p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {capabilities.map(({ label, Icon }) => (
              <div key={label} className="flex min-h-16 items-center gap-3 border border-white/15 bg-white/5 px-4 text-sm font-bold">
                <Icon className="shrink-0 text-orange-300" size={20} />
                {label}
              </div>
            ))}
          </div>
          <Link href="/factory" className="mt-8 inline-flex items-center gap-2 text-sm font-black text-white underline decoration-[var(--orange)] decoration-2 underline-offset-4">
            Explore factory capability <ArrowRight size={17} />
          </Link>
        </div>
      </div>
    </section>
  );
}
