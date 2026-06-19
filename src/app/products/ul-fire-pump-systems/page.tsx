import Image from "next/image";
import Link from "next/link";
import { SimplePage } from "@/components/simple-page";

const modules = [
  "UL fire pump package positioning",
  "NFPA20 related quotation inputs",
  "Diesel, electric and jockey pump combinations",
  "Controller, baseplate, pipework and accessory scope",
  "Testing evidence and document download path",
  "Application links for warehouses, data centers and industrial projects",
];

export default function UlFirePumpSystemsPage() {
  return (
    <SimplePage
      eyebrow="UL Fire Pump Systems"
      title="A dedicated path for UL / NFPA20 ready fire pump package buyers."
      text="The report recommends separating UL and compliance content from the general product list. This page gives procurement teams a faster way to evaluate package scope, standards, documents and quotation requirements."
    >
      <section className="section">
        <div className="container-shell grid gap-10 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="relative min-h-[380px] overflow-hidden rounded-lg bg-slate-100">
            <Image src="/assets/applications/hero-edj.webp" alt="UL fire pump package with electric diesel and jockey pump" fill className="object-cover" />
          </div>
          <div>
            <p className="eyebrow mb-4">Package Scope</p>
            <h2 className="text-3xl font-black text-[var(--navy-950)]">Sell the system, not just one pump.</h2>
            <p className="mt-5 leading-8 text-slate-600">
              Fire pump buyers compare drivers, controllers, base frames, accessories, documentation and compliance evidence.
              This page is structured for that decision process and links directly to inquiry and downloads.
            </p>
            <div className="mt-7 grid gap-3">
              {modules.map((module) => (
                <div key={module} className="rounded-md border border-slate-200 bg-white p-4 font-bold text-slate-700">{module}</div>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link className="button button-primary" href="/contact">Request UL Pump Quote</Link>
              <Link className="button button-secondary" href="/downloads">Download Checklist</Link>
            </div>
          </div>
        </div>
      </section>
    </SimplePage>
  );
}
