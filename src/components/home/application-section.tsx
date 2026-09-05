import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SectionHeading } from "@/components/section-heading";
import { applications } from "@/data/site";

type ApplicationSectionProps = {
  featuredOnly?: boolean;
};

const featuredApplicationSlugs = [
  "warehouse-fire-protection",
  "data-center-fire-protection",
  "oil-gas-fire-pump-package",
  "industrial-plant-fire-protection",
];

export function ApplicationSection({ featuredOnly = false }: ApplicationSectionProps) {
  const visibleApplications = featuredOnly
    ? applications.filter((item) => featuredApplicationSlugs.includes(item.slug))
    : applications;

  return (
    <section className={featuredOnly ? "home-applications-section" : "section"}>
      <div className={featuredOnly ? "py-20 md:py-24" : ""}>
        <SectionHeading
          eyebrow="Applications"
          title={featuredOnly ? "Choose by project condition, not product name alone." : "Designed around real fire protection projects."}
          text="Connect the application, water source and operating conditions with the pump configuration that needs review."
        />
        <div className="application-grid-compact container-shell grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {visibleApplications.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.slug} href={"/applications/" + item.slug} className="application-tile card card-interactive group overflow-hidden">
                <div className="application-tile-media relative h-[180px]">
                  <Image src={item.image} alt={item.title + " fire protection application"} fill className="object-cover transition duration-500 group-hover:scale-105" sizes="(min-width: 1280px) 25vw, 50vw" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[rgba(7,20,38,0.5)] to-transparent" />
                </div>
                <div className="application-tile-body p-5">
                  <div className="mb-3 flex items-center gap-2">
                    <Icon className="text-[var(--orange)]" size={20} />
                    <h3 className="text-lg font-black text-[var(--navy-950)]">{item.title}</h3>
                  </div>
                  <p className="application-tile-text text-sm leading-6 text-slate-600">{item.text}</p>
                  <span className="application-tile-pill mt-5 inline-flex items-center gap-1 text-xs font-black uppercase tracking-[0.08em] text-[var(--navy-800)]">
                    {item.recommended}<ArrowUpRight size={15} />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
