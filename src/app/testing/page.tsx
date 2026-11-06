import type { Metadata } from "next";
import { ClipboardCheck, FileText, Gauge, Settings2 } from "lucide-react";
import { InteriorBanner } from "@/components/interior/content";
import { InteriorFrame, PageMast, SectionHeading } from "@/components/interior/frame";
import { localizedAlternates } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Fire Pump Testing Capability",
  description: "Review fire pump testing, inspection, controller checks and documentation support before export shipment.",
  alternates: localizedAlternates("/testing"),
};

const testingSteps = [
  { icon: Settings2, title: "Assembly inspection", text: "Review the pump, driver and controller arrangement against the agreed scope." },
  { icon: Gauge, title: "Operating checks", text: "Confirm the flow and pressure review points for the selected configuration." },
  { icon: ClipboardCheck, title: "Controller and start checks", text: "Review the specified starting sequence and controller interfaces." },
  { icon: FileText, title: "Project documentation", text: "Confirm the inspection records and submittal documents required for dispatch." },
];

export default function TestingPage() {
  return (
    <InteriorFrame path="/testing" breadcrumbs={[{ label: "Factory", href: "/factory" }, { label: "Testing" }]}>
      <PageMast eyebrow="Quality & testing" title="Factory testing capability" text="Assembly, operating checks and documentation for project review." />
      <section className="interior-shell interior-band interior-split">
        <figure><video className="interior-video" controls preload="none" poster="/assets/applications/hero-edj.webp" src="/assets/videos/dual-power.mp4" aria-label="EDJ fire pump package demonstration" /><figcaption className="interior-copy mt-2 text-sm">EDJ fire pump package demonstration</figcaption></figure>
        <div><SectionHeading eyebrow="Inspection workflow" title="Equipment review before dispatch" />
          <dl className="interior-contact-list">{testingSteps.map(({ icon: Icon, title, text }) => <div key={title}><dt><Icon size={17} />{title}</dt><dd>{text}</dd></div>)}</dl>
        </div>
      </section>
      <InteriorBanner title="Certificates & documents" text="Review the available certificates or request documentation for your configuration." href="/certificates" label="View documents" />
    </InteriorFrame>
  );
}
