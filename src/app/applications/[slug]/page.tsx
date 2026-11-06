import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowRight, Check, ClipboardList, Gauge, PanelsTopLeft } from "lucide-react";
import { InteriorFrame, InteriorTabs, PageMast, SectionHeading } from "@/components/interior/frame";
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

const applicationViews = [
  { id: "overview", label: "Project overview", icon: PanelsTopLeft },
  { id: "selection", label: "Pump selection", icon: Gauge },
  { id: "enquiry", label: "Project inquiry", icon: ClipboardList },
] as const;

type ApplicationView = (typeof applicationViews)[number]["id"];
type ApplicationPageProps = { params: Promise<{ slug: string }>; searchParams: Promise<{ view?: string }> };
type ApplicationMetadataProps = { params: Promise<{ slug: string }> };

function getApplicationView(value: string | undefined): ApplicationView {
  return applicationViews.some((item) => item.id === value) ? (value as ApplicationView) : "overview";
}

export async function generateStaticParams() {
  return applications.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: ApplicationMetadataProps): Promise<Metadata> {
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

export default async function ApplicationDetailPage({ params, searchParams }: ApplicationPageProps) {
  const { slug } = await params;
  const { view } = await searchParams;
  const application = applications.find((item) => item.slug === slug);
  if (!application) notFound();
  const guidance = applicationGuidance[application.slug] || applicationGuidance["industrial-plant-fire-protection"];
  const activeView = getApplicationView(view);
  const path = `/applications/${application.slug}`;

  return (
    <InteriorFrame path={path} breadcrumbs={[{ label: "Applications", href: "/applications" }, { label: application.title }]}>
      <PageMast eyebrow="Industry application" title={`${application.title} Fire Protection`} text={application.text} image={{ src: application.image, alt: application.title }} />
      <div className="interior-shell">
        <InteriorTabs label="Application information" links={applicationViews.map(({ id, label, icon: Icon }) => ({ label, href: id === "overview" ? path : `${path}?view=${id}`, current: activeView === id, icon: <Icon size={16} /> }))} />
        {activeView === "overview" && <section className="interior-detail-panel interior-split">
          <div>
            <SectionHeading eyebrow="Project overview" title="What to review" />
            <p className="interior-copy">{guidance.background}</p>
            <ul className="interior-check-list mt-4">{guidance.challenges.map((item) => <li key={item}><Check size={16} />{item}</li>)}</ul>
          </div>
          <aside className="interior-detail-aside"><Gauge size={24} /><h3 className="my-2">{application.title} selection</h3><p className="interior-copy">Configuration to review: {application.recommended}</p><Link href={`${path}?view=selection`} scroll={false} className="interior-text-link mt-3" prefetch={false}>Pump selection <ArrowRight size={15} /></Link></aside>
        </section>}
        {activeView === "selection" && <section className="interior-detail-panel interior-split">
          <div>
            <SectionHeading eyebrow="Equipment selection" title="Selection criteria" />
            <ol className="interior-copy list-decimal space-y-2 ps-5">{guidance.selection.map((item) => <li key={item}>{item}</li>)}</ol>
            <h3 className="mt-6 font-extrabold">Installation and project files</h3><p className="interior-copy mt-2">{guidance.installation}</p>
          </div>
          <aside className="interior-detail-aside"><h3 className="mb-2">Product configurations</h3><ul className="interior-check-list">{guidance.products.map((item) => <li key={item}><Check size={16} />{item}</li>)}</ul><Link href="/products" className="interior-text-link mt-3" prefetch={false}>Browse products <ArrowRight size={15} /></Link></aside>
        </section>}
        {activeView === "enquiry" && <section className="interior-detail-panel interior-split interior-quote-split">
          <div><SectionHeading eyebrow="Project inquiry" title="Information to prepare" /><ul className="interior-check-list">{guidance.enquiry.map((item) => <li key={item}><Check size={16} />{item}</li>)}</ul>
            <h3 className="mt-6 text-lg font-extrabold">Common questions</h3>{guidance.faq.map(([question, answer]) => <details key={question} className="interior-form-more"><summary>{question} <span aria-hidden="true">+</span></summary><p className="interior-copy mt-2">{answer}</p></details>)}
          </div>
          <div className="interior-form-surface"><ProductInquiryForm productTitle={`${application.title} project fire protection`} initial={{ application: application.title }} /></div>
        </section>}
      </div>
    </InteriorFrame>
  );
}
