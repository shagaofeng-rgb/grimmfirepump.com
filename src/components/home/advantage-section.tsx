import { advantages } from "@/data/site";
import { SectionHeading } from "@/components/section-heading";

export function AdvantageSection() {
  return (
    <section className="section">
      <SectionHeading
        eyebrow="Why Choose GRIMM"
        title="Built for project buyers who need certainty before shipment."
        text="Overseas fire protection buyers do not only need a pump. They need a configured system, clear documents, reliable testing and a supplier who can reply with engineering details."
      />
      <div className="container-shell grid gap-px overflow-hidden rounded-lg border border-slate-200 bg-slate-200 md:grid-cols-2 xl:grid-cols-4">
        {advantages.map((item) => {
          const Icon = item.icon;
          return (
            <article key={item.title} className="min-h-[190px] bg-white p-5 md:min-h-[215px] md:p-6">
              <div className="mb-5">
                <Icon className="text-[var(--orange)]" size={24} />
              </div>
              <h3 className="text-base font-black leading-tight text-[var(--navy-950)] md:text-xl">{item.title}</h3>
              <p className="mt-3 text-xs leading-5 text-slate-600 md:text-sm md:leading-6">{item.text}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
