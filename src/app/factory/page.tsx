import type { Metadata } from "next";
import Image from "next/image";
import { CertificateSection } from "@/components/home/certificate-section";
import { FactorySection } from "@/components/home/factory-section";
import { VideoSection } from "@/components/home/video-section";
import { SimplePage } from "@/components/simple-page";
import { waterSystemInnovationDocuments } from "@/data/site";
import { localizedAlternates } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Fire Pump Factory Capability",
  description: "See GRIMM pump manufacturing, assembly, testing, quality control, certificates and factory capability for export projects.",
  alternates: localizedAlternates("/factory"),
};

export default function FactoryPage() {
  return (
    <SimplePage
      eyebrow="Factory Capability"
      title="Manufacturing strength for pump packages and export projects."
      text="A documented view of manufacturing, machining, electrical assembly and water-system capability for global project buyers."
    >
      <FactorySection />
      <section className="section bg-[var(--grey-50)]">
        <div className="container-shell grid gap-8 lg:grid-cols-[0.75fr_1.25fr]">
          <div>
            <p className="eyebrow">Water System Innovation</p>
            <h2 className="mt-3 text-3xl font-black leading-tight text-[var(--navy-950)]">Supporting water treatment and integrated-station applications.</h2>
            <p className="mt-5 max-w-xl leading-7 text-slate-600">
              Alongside fire-pump systems, GRIMM maintains water-supply, sewage and integrated-pump-station capability. The documents below are presented as water-system innovation evidence, not as fire-pump approvals.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {waterSystemInnovationDocuments.map((item) => (
              <article key={item.title} className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                <a href={item.src} target="_blank" rel="noreferrer" className="relative block h-44 bg-slate-50" aria-label={`Open ${item.title} document preview`}>
                  <Image src={item.src} alt={`${item.title} utility model document`} fill className="object-contain p-4" sizes="(min-width: 1024px) 25vw, 50vw" />
                </a>
                <div className="p-5">
                  <h3 className="font-black leading-6 text-[var(--navy-950)]">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{item.note}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
      <CertificateSection />
      <VideoSection />
    </SimplePage>
  );
}
