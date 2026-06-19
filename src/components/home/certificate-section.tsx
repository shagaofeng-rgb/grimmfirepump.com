import Image from "next/image";
import Link from "next/link";
import { SectionHeading } from "@/components/section-heading";
import { certificates } from "@/data/site";

export function CertificateSection() {
  return (
    <section className="section bg-[var(--grey-50)]">
      <SectionHeading
        eyebrow="Certificates & Documents"
        title="Trust material prepared for overseas procurement review."
        action={<Link className="button button-secondary" href="/downloads">Request Certificates</Link>}
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
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
