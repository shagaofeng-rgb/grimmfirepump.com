import Image from "next/image";
import Link from "next/link";
import { SectionHeading } from "@/components/section-heading";
import { certificates } from "@/data/site";

export function CertificateSection() {
  return (
    <section className="section bg-[var(--grey-50)]">
      <SectionHeading
        eyebrow="Certificates & Documents"
        title="Documented evidence for technical and procurement review."
        text="Public certificates are shown with their stated scope and validity. Project-specific documents are confirmed against the quoted configuration."
        action={<Link className="button button-secondary" href="/certificates">View Certificates</Link>}
      />
      <div className="container-shell grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {certificates.map((item) => (
          <article key={item.title} className="card overflow-hidden">
            <div className="relative h-[210px] bg-slate-50">
              <Image src={item.src} alt={item.title} fill loading="eager" className="object-contain p-4" />
            </div>
            <div className="p-5">
              <h3 className="text-lg font-black text-[var(--navy-950)]">{item.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{item.note}</p>
              <p className="mt-4 text-xs font-bold uppercase tracking-[0.08em] text-[var(--navy-800)]">{item.validity}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
