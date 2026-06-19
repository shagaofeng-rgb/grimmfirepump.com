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
      <div className="container-shell grid grid-cols-2 gap-4 md:gap-6 xl:grid-cols-4">
        {advantages.map((item, index) => {
          const Icon = item.icon;
          return (
            <article key={item.title} className="card min-h-[190px] p-4 md:min-h-[220px] md:p-6">
              <div className="mb-4 flex items-center justify-between md:mb-6">
                <Icon className="text-[var(--orange)]" size={24} />
                <span className="text-sm font-black text-[var(--orange)]">{String(index + 1).padStart(2, "0")}</span>
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
