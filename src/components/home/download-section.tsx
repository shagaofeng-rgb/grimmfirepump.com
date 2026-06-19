import Link from "next/link";
import { SectionHeading } from "@/components/section-heading";
import { downloads } from "@/data/site";

export function DownloadSection() {
  return (
    <section className="section">
      <SectionHeading
        eyebrow="Download Center"
        title="Turn technical documents into qualified leads."
        text="Every download should open a short form so sales can follow up with country, usage and contact details."
      />
      <div className="container-shell grid gap-5 lg:grid-cols-3">
        {downloads.map((item, index) => (
          <article key={item.title} className="card p-6">
            <h3 className="text-xl font-black text-[var(--navy-950)]">{item.title}</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">{item.text}</p>
            <Link className={`button mt-5 min-h-11 ${index === 0 ? "button-primary" : "button-secondary"}`} href="/downloads">
              {index === 0 ? "Download PDF" : "Request Files"}
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
