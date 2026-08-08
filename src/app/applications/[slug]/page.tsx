import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { StickyCta } from "@/components/sticky-cta";
import { ProductInquiryForm } from "@/components/product-inquiry-form";
import { applications } from "@/data/site";

const applicationGuidance: Record<string, { background: string; challenges: string[]; selection: string[]; products: string[]; installation: string; enquiry: string[]; faq: Array<[string, string]> }> = {
  "warehouse-fire-protection": {
    background: "Warehouses and logistics buildings may combine large sprinkler zones, changing storage layouts and long pipe runs. The pump-room design needs to be coordinated with the approved hydraulic calculation and the facility's operating plan.",
    challenges: ["Maintaining required sprinkler pressure across large distribution areas", "Coordinating water storage, suction conditions and header routing", "Leaving access for testing, servicing and future inspection"],
    selection: ["Confirm the approved flow and pressure duty", "Confirm water source and available electrical supply", "Confirm whether the project specifies electric, diesel or EDJ configuration"],
    products: ["EDJ Fire Pump Set", "Electric + Jockey Pump Set", "Diesel Engine Fire Pump"],
    installation: "Provide the pump-room layout, water-source information, connection directions, ventilation and drainage requirements. Do not select a driver arrangement before the approved project documents identify it.",
    enquiry: ["Approved flow and head", "Warehouse area and sprinkler design information", "Power supply and project country", "Pump-room drawing and requested documents"],
    faq: [["Can a jockey pump replace the main fire pump?", "No. It maintains standby pressure and does not replace the specified main fire-pump duty."], ["What should be shared for selection?", "Share approved hydraulic duty, water source, power conditions and project documentation requirements."]],
  },
  "data-center-fire-protection": {
    background: "Data centers are critical facilities where utility interfaces, maintenance access and documented review are often tightly coordinated. Fire-water equipment should be considered together with power, controls, storage and the approved fire-protection design.",
    challenges: ["Coordinating redundancy requirements without assuming unapproved configurations", "Providing clear controller, alarm and document interfaces", "Maintaining access, drainage and ventilation in a constrained equipment room"],
    selection: ["Use the approved hydraulic duty as the starting point", "Identify the required main, standby and pressure-maintenance roles", "Review controller signals and electrical or diesel interfaces with the project team"],
    products: ["EDJ Fire Pump Set", "Electric + Jockey Pump Set", "Jockey Pump / Vertical Multistage Fire Pump"],
    installation: "Provide the fire strategy, duty point, room layout, water source, required alarm interfaces and document list. The final configuration must follow the approved project specification.",
    enquiry: ["Approved flow and head", "Required main/standby arrangement", "Voltage, frequency and control interfaces", "Room drawing, country and submittal requirements"],
    faq: [["Does every data center require an EDJ set?", "No. The required configuration must be determined by the approved design and local project requirements."], ["Why is a jockey pump included?", "It can maintain standby system pressure and reduce unnecessary main-pump starts."]],
  },
  "oil-gas-fire-pump-package": {
    background: "Oil and gas facilities can involve outdoor exposure, remote utility conditions and demanding inspection or documentation processes. The selection should be based on the verified fire-water duty, site environment and approved project scope.",
    challenges: ["Driver and water-source coordination at remote or industrial sites", "Pump-room or skid access for service and inspection", "Clear documentation for contractor and owner review"],
    selection: ["Confirm the fire-water duty and water-source conditions", "Confirm the specified driver and any standby requirement", "Review fuel, ventilation, drainage and control arrangements as project interfaces"],
    products: ["Diesel Engine Fire Pump", "Diesel Engine + Jockey Pump Set", "Diesel Engine Long-Shaft Fire Pump"],
    installation: "Share environmental conditions, water-source details, access constraints, fuel or power interfaces and the requested documentation package before equipment selection.",
    enquiry: ["Flow, head and water-source information", "Installation environment and location", "Specified driver arrangement", "Required drawings, test data and certificates"],
    faq: [["Is a diesel pump automatically suitable for every remote site?", "No. Duty, water source, installation, fuel arrangement and project approvals still require review."], ["Can long-shaft pumps be selected without water-source details?", "No. The source level and installation arrangement are selection inputs."]],
  },
  "industrial-plant-fire-protection": {
    background: "Industrial plants may combine process areas, warehouses, utilities and outdoor equipment. A fire-water system has to fit the approved hazard analysis, available water source and the way the facility will be maintained.",
    challenges: ["Matching the package to the approved hydraulic calculation", "Coordinating utility-room interfaces with other contractors", "Preparing service access and commissioning records"],
    selection: ["Confirm design flow, pressure and water source", "Identify the specified electric, diesel or EDJ arrangement", "Confirm installation, controls and document requirements before quotation"],
    products: ["EDJ Fire Pump Set", "Diesel Engine Fire Pump", "Electric Horizontal Split Case Fire Pump"],
    installation: "Provide the process-area context, pump-room drawing, utility availability, pipe direction and requested delivery documents. The proposed system must be reviewed against the approved project specification.",
    enquiry: ["Approved duty and water-source data", "Plant application and installation location", "Power or diesel-driver requirements", "Required drawings, curves and inspection records"],
    faq: [["What is the first selection input?", "The approved flow and pressure duty together with water-source information."], ["Can a product page confirm compliance?", "No. Compliance and certification must be verified for the exact quoted configuration and project." ]],
  },
};

type ApplicationPageProps = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return applications.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: ApplicationPageProps): Promise<Metadata> {
  const { slug } = await params;
  const application = applications.find((item) => item.slug === slug);
  if (!application) return {};
  return {
    title: `${application.title} Fire Protection`,
    description: `${application.keyword}: recommended pump configuration, project challenges and inquiry path.`,
    alternates: { canonical: `/applications/${application.slug}` },
    openGraph: {
      title: `${application.title} Fire Protection`,
      description: `${application.keyword}: recommended pump configuration, project challenges and inquiry path.`,
      images: [application.image],
    },
  };
}

export default async function ApplicationDetailPage({ params }: ApplicationPageProps) {
  const { slug } = await params;
  const application = applications.find((item) => item.slug === slug);
  if (!application) notFound();
  const guidance = applicationGuidance[application.slug] || applicationGuidance["industrial-plant-fire-protection"];

  return (
    <>
      <Header />
      <main>
        <section className="container-shell grid gap-12 py-20 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="eyebrow mb-4">{application.keyword}</p>
            <h1 className="text-5xl font-black leading-tight text-[var(--navy-950)]">{application.title} Fire Protection</h1>
            <p className="mt-6 text-lg leading-8 text-slate-600">{application.text}</p>
            <p className="mt-6 rounded-lg bg-blue-50 p-5 font-bold text-[var(--navy-800)]">Recommended: {application.recommended}</p>
            <Link className="button button-primary mt-8" href="/contact">Get Engineering Advice</Link>
          </div>
          <div className="relative min-h-[420px] overflow-hidden rounded-lg">
            <Image src={application.image} alt={`${application.title} fire protection`} fill priority className="object-cover" />
          </div>
        </section>
        <section className="bg-[var(--grey-50)] py-14">
          <div className="container-shell grid gap-6 lg:grid-cols-2">
            <article className="rounded-lg border border-slate-200 bg-white p-7"><h2 className="text-2xl font-black text-[var(--navy-950)]">Industry context</h2><p className="mt-4 leading-8 text-slate-600">{guidance.background}</p></article>
            <article className="rounded-lg border border-slate-200 bg-white p-7"><h2 className="text-2xl font-black text-[var(--navy-950)]">Project issues to review</h2><ul className="mt-4 grid gap-3 text-slate-700">{guidance.challenges.map((item) => <li key={item}>• {item}</li>)}</ul></article>
            <article className="rounded-lg border border-slate-200 bg-white p-7"><h2 className="text-2xl font-black text-[var(--navy-950)]">Selection logic</h2><ol className="mt-4 grid gap-3 text-slate-700">{guidance.selection.map((item, index) => <li key={item}>{index + 1}. {item}</li>)}</ol></article>
            <article className="rounded-lg border border-slate-200 bg-white p-7"><h2 className="text-2xl font-black text-[var(--navy-950)]">Typical product paths</h2><ul className="mt-4 grid gap-3 text-slate-700">{guidance.products.map((item) => <li key={item}>• {item}</li>)}</ul></article>
            <article className="rounded-lg border border-slate-200 bg-white p-7 lg:col-span-2"><h2 className="text-2xl font-black text-[var(--navy-950)]">Installation and project files</h2><p className="mt-4 leading-8 text-slate-600">{guidance.installation}</p></article>
          </div>
        </section>
        <section className="container-shell grid gap-8 py-14 lg:grid-cols-[0.8fr_1.2fr]">
          <div><p className="eyebrow">Project enquiry</p><h2 className="mt-3 text-3xl font-black text-[var(--navy-950)]">Information to prepare</h2><ul className="mt-6 grid gap-3 leading-7 text-slate-700">{guidance.enquiry.map((item) => <li key={item}>• {item}</li>)}</ul><h2 className="mt-10 text-2xl font-black text-[var(--navy-950)]">FAQ</h2>{guidance.faq.map(([question, answer]) => <div key={question} className="mt-5"><h3 className="font-black text-[var(--navy-950)]">{question}</h3><p className="mt-2 leading-7 text-slate-600">{answer}</p></div>)}</div>
          <div className="rounded-lg bg-[var(--navy-950)] p-6 md:p-8"><ProductInquiryForm productTitle={`${application.title} project fire protection`} /></div>
        </section>
      </main>
      <Footer />
      <StickyCta />
    </>
  );
}
