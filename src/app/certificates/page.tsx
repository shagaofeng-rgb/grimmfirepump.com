import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SimplePage } from "@/components/simple-page";
import { certificates } from "@/data/site";
import { localizedAlternates } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Fire Pump Certificates and Documents",
  description: "Review available GRIMM quality certificates, CE documents, test reports and project document packages for fire pump buyers.",
  alternates: localizedAlternates("/certificates"),
};

export default function CertificatesPage() {
  return (
    <SimplePage
      eyebrow="Certificates & Documents"
      title="Certificate evidence organized for project review."
      text="Review public management-system and fire-pump attestation documents with their stated scope and validity. Project documentation is confirmed for the actual quoted configuration."
    >
      <section className="section">
        <div className="container-shell grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {certificates.map((item) => (
            <article key={item.title} className="card overflow-hidden">
              <a href={item.src} target="_blank" rel="noreferrer" className="relative block h-60 bg-slate-50 p-4" aria-label={`Open ${item.title} certificate preview`}>
                <Image src={item.src} alt={`${item.title} certificate preview`} fill className="object-contain p-4 transition duration-300 hover:scale-[1.02]" sizes="(min-width: 1280px) 25vw, (min-width: 768px) 50vw, 100vw" />
              </a>
              <div className="p-6">
                <p className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--orange-dark)]">{item.validity}</p>
                <h2 className="mt-3 text-xl font-black leading-7 text-[var(--navy-950)]">{item.title}</h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">{item.note}</p>
                <p className="mt-4 text-xs font-semibold text-slate-500">Issued by {item.issuer}</p>
              </div>
            </article>
          ))}
        </div>
        <div className="container-shell mt-10 grid gap-8 border-y border-slate-200 py-9 lg:grid-cols-[0.7fr_1.3fr]">
          <div>
            <p className="eyebrow">Project documents</p>
            <h2 className="mt-3 text-2xl font-black leading-tight text-[var(--navy-950)]">Need documents for a specific project?</h2>
          </div>
          <div>
            <p className="leading-7 text-slate-600">
              Third-party test reports are available for selected water-supply equipment, diesel pump trucks, integrated pump stations,
              sewage-treatment equipment and submersible sewage pumps. Send the required flow, head, driver type, country and project
              standard so the documentation can be checked against the actual requested configuration.
            </p>
            <p className="mt-4 text-sm leading-6 text-slate-500">
              Certificates and attestations apply only within their stated scope. They are not a substitute for project-specific approval or document review.
            </p>
            <Link className="button button-primary mt-6" href="/contact">Request Documents</Link>
          </div>
        </div>
      </section>
    </SimplePage>
  );
}
