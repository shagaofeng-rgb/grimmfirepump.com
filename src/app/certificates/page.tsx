import Image from "next/image";
import Link from "next/link";
import { SimplePage } from "@/components/simple-page";
import { certificates } from "@/data/site";

export default function CertificatesPage() {
  return (
    <SimplePage
      eyebrow="Certificates & Documents"
      title="Documents, standards and certificate evidence organized for buyer review."
      text="This page is prepared for CE, quality documents, test reports, patents and project review materials, with downloadable packs available through the download center."
    >
      <section className="section">
        <div className="container-shell grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {certificates.map((item) => (
            <article key={item.title} className="card p-6">
              <div className="relative mb-5 h-36 rounded-md bg-slate-50">
                <Image src={item.src} alt={item.title} fill className="object-contain p-5" />
              </div>
              <h2 className="text-xl font-black text-[var(--navy-950)]">{item.title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">{item.note}</p>
            </article>
          ))}
        </div>
        <div className="container-shell mt-10 rounded-lg bg-[var(--grey-50)] p-8">
          <h2 className="text-2xl font-black text-[var(--navy-950)]">Need project review documents?</h2>
          <p className="mt-3 max-w-3xl leading-7 text-slate-600">
            Send the required flow, head, driver type, country and project standard. GRIMM PUMP will confirm the available
            documentation package and quotation path for your project.
          </p>
          <Link className="button button-primary mt-6" href="/contact">Ask for Document Support</Link>
        </div>
      </section>
    </SimplePage>
  );
}
