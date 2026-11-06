import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Factory, FileText, MapPin } from "lucide-react";
import { InteriorFrame, PageMast, SectionHeading } from "@/components/interior/frame";
import { company } from "@/data/site";
import { localizedAlternates } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "About GRIMM PUMP",
  description: "Learn about GRIMM PUMP, an export-facing fire pump and water system manufacturer serving EPC buyers and global project contractors.",
  alternates: localizedAlternates("/about"),
};

export default function AboutPage() {
  return (
    <InteriorFrame path="/about" breadcrumbs={[{ label: "About" }]}>
      <PageMast eyebrow="About the company" title="GRIMM PUMP" text="Fire pump systems, water supply equipment and pumping solutions."
        image={{ src: "/assets/factory/real/vertical-pump-assembly.webp", alt: "Vertical pumps at the GRIMM workshop" }} />
      <section className="interior-shell interior-band interior-split">
        <div>
          <SectionHeading eyebrow="Company profile" title={company.legalName} />
          <p className="interior-copy">Based in Quzhou, Zhejiang, GRIMM supplies fire pump packages and water system equipment for contractors, distributors and project owners.</p>
          <p className="interior-copy mt-3">Fire pump packages include EDJ, diesel and electric arrangements. The wider product range covers water supply, sewage and integrated pumping systems.</p>
          <Link className="interior-text-link mt-4" href="/products" prefetch={false}>Explore the product catalog <ArrowRight size={15} /></Link>
        </div>
        <dl className="interior-contact-list">
          <div><dt><MapPin size={17} /> Company address</dt><dd>{company.address}</dd></div>
          <div><dt><Factory size={17} /> Manufacturing</dt><dd><Link href="/factory" prefetch={false}>Visit the workshop</Link></dd></div>
          <div><dt><FileText size={17} /> Company documents</dt><dd><Link href="/certificates" prefetch={false}>View certificates</Link></dd></div>
        </dl>
      </section>
    </InteriorFrame>
  );
}
