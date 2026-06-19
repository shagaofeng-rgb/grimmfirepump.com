import Link from "next/link";
import { BookOpenCheck, FileDown, ShieldCheck, Wrench } from "lucide-react";
import { SectionHeading } from "@/components/section-heading";

const complianceItems = [
  {
    icon: ShieldCheck,
    title: "UL / NFPA20 purchasing path",
    text: "A dedicated page explains package scope, driver options, controller evidence and quotation inputs.",
    href: "/products/ul-fire-pump-systems",
  },
  {
    icon: Wrench,
    title: "Testing capability",
    text: "Pump testing, controller checks, packaging review and shipment evidence support project confidence.",
    href: "/testing",
  },
  {
    icon: FileDown,
    title: "Download center",
    text: "Catalogs, datasheets, certificate packs and submittal documents are organized for buyer review.",
    href: "/downloads",
  },
  {
    icon: BookOpenCheck,
    title: "Knowledge center",
    text: "Selection guides and fire pump articles answer technical questions before buyers submit an inquiry.",
    href: "/knowledge",
  },
];

export function ComplianceSection() {
  return (
    <section className="section bg-white">
      <SectionHeading
        eyebrow="Compliance & Buyer Evidence"
        title="Make the technical proof visible before the inquiry."
        text="The rebuilt site separates sales content from engineering evidence, so buyers can quickly check standards, testing, downloads and technical guidance."
      />
      <div className="container-shell grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {complianceItems.map((item) => (
          <Link key={item.title} href={item.href} className="card group p-5 transition hover:-translate-y-1 hover:shadow-xl">
            <item.icon className="mb-5 text-[var(--orange)]" size={26} />
            <h3 className="text-lg font-black text-[var(--navy-950)]">{item.title}</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">{item.text}</p>
            <span className="mt-5 inline-flex text-sm font-black text-[var(--navy-800)] underline decoration-[var(--orange)] decoration-2 underline-offset-4">
              View page
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
