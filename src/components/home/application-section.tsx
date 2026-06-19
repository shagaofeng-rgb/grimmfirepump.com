import Image from "next/image";
import Link from "next/link";
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
    <section className="section">
      <SectionHeading
        eyebrow="Applications"
        title="Designed around real fire protection projects."
        text="Each application page connects the buyer's project conditions with recommended pump configurations."
      />
      <div className="application-grid-compact container-shell grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {visibleApplications.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.slug} href={`/applications/${item.slug}`} className="application-tile card group overflow-hidden">
              <div className="application-tile-media relative h-[155px]">
                <Image src={item.image} alt={`${item.title} fire protection application`} fill className="object-cover transition duration-300 group-hover:scale-105" sizes="(min-width: 1280px) 25vw, 50vw" />
              </div>
              <div className="application-tile-body p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Icon className="text-[var(--orange)]" size={20} />
                  <h3 className="text-lg font-black text-[var(--navy-950)]">{item.title}</h3>
                </div>
                <p className="application-tile-text text-sm leading-6 text-slate-600">{item.text}</p>
                <span className="application-tile-pill mt-3 inline-flex rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-[var(--navy-800)]">
                  {item.recommended}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
