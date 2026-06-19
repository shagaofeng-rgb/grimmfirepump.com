import Image from "next/image";
import Link from "next/link";
import { SimplePage } from "@/components/simple-page";

const testingSteps = [
  "Pump assembly inspection before testing",
  "Flow, head and pressure verification",
  "Controller and starting logic check",
  "Packaging, shipment and document review",
];

export default function TestingPage() {
  return (
    <SimplePage
      eyebrow="Testing Capability"
      title="Testing evidence buyers can review before shipment."
      text="Fire pump procurement depends on proof. This page turns workshop, test area and document review into a dedicated trust path instead of burying it in a long homepage."
    >
      <section className="section">
        <div className="container-shell grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="relative min-h-[380px] overflow-hidden rounded-lg bg-slate-100">
            <Image src="/assets/factory/factory-testing.webp" alt="Fire pump testing area" fill className="object-cover" />
          </div>
          <div>
            <p className="eyebrow mb-4">Quality Flow</p>
            <h2 className="text-3xl font-black text-[var(--navy-950)]">From assembled package to project submittal.</h2>
            <div className="mt-7 grid gap-4">
              {testingSteps.map((step, index) => (
                <div key={step} className="flex gap-4 border-b border-slate-200 pb-4">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[var(--orange)] text-sm font-black text-white">
                    {index + 1}
                  </span>
                  <p className="pt-1 font-bold leading-7 text-slate-700">{step}</p>
                </div>
              ))}
            </div>
            <Link className="button button-primary mt-8" href="/downloads">Request Test Documents</Link>
          </div>
        </div>
      </section>
    </SimplePage>
  );
}
