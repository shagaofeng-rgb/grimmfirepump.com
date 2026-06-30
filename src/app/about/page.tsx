import type { Metadata } from "next";
import Link from "next/link";
import { SimplePage } from "@/components/simple-page";
import { company } from "@/data/site";

export const metadata: Metadata = {
  title: "About GRIMM PUMP",
  description: "Learn about GRIMM PUMP, an export-facing fire pump and water system manufacturer serving EPC buyers and global project contractors.",
  alternates: { canonical: "/about" },
};

const proofPoints = [
  "Fire pump, water supply, sewage and irrigation product lines inherited from the existing website.",
  "Focus on complete EDJ, diesel + jockey and electric + jockey fire pump package requirements.",
  "Factory evidence, testing documents, downloads and project cases are separated into dedicated pages.",
];

export default function AboutPage() {
  return (
    <SimplePage
      eyebrow="About GRIMM PUMP"
      title="A clearer international brand for technical fire pump buyers."
      text="The rebuilt website positions GRIMM PUMP as the export-facing fire pump systems brand of Grimm Water Treatment, with a stronger structure for trust, SEO and inquiries."
    >
      <section className="section">
        <div className="container-shell grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="eyebrow mb-4">Company Positioning</p>
            <h2 className="text-3xl font-black leading-tight text-[var(--navy-950)]">Factory-built pump systems with buyer evidence.</h2>
            <p className="mt-5 leading-8 text-slate-600">
              {company.shortName} serves EPC contractors, fire protection companies, distributors and project owners who need
              clear product data, testing proof, downloadable documents and fast technical communication before placing an order.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link className="button button-primary" href="/contact">Contact Sales</Link>
              <Link className="button button-secondary" href="/factory">View Factory</Link>
            </div>
          </div>
          <div className="grid gap-4">
            {proofPoints.map((point) => (
              <div key={point} className="border-b border-slate-200 pb-4">
                <p className="font-bold leading-7 text-[var(--navy-900)]">{point}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </SimplePage>
  );
}
