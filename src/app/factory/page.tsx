import type { Metadata } from "next";
import Link from "next/link";
import { Factory, FileText, Gauge, Video } from "lucide-react";
import { InteriorBanner, MediaCard } from "@/components/interior/content";
import { InteriorFrame, InteriorTabs, PageMast, SectionHeading } from "@/components/interior/frame";
import { factoryImages, waterSystemInnovationDocuments } from "@/data/site";
import { localizedAlternates } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Fire Pump Factory Capability",
  description: "See GRIMM pump manufacturing, assembly, testing, quality control, certificates and factory capability for export projects.",
  alternates: localizedAlternates("/factory"),
};

const views = [
  { id: "workshop", label: "Workshop", icon: Factory },
  { id: "videos", label: "Factory videos", icon: Video },
  { id: "documents", label: "Utility models", icon: FileText },
] as const;

const videos = [
  { title: "Factory tour", src: "/assets/videos/factory-tour-2.mp4", poster: factoryImages[0].src },
  { title: "Dual power package", src: "/assets/videos/dual-power.mp4", poster: "/assets/applications/hero-edj.webp" },
  { title: "Pump truck test", src: "/assets/videos/pump-truck-test.mp4", poster: "/assets/factory/real/cnc-machining.webp" },
];

export default async function FactoryPage({ searchParams }: { searchParams: Promise<{ view?: string }> }) {
  const { view } = await searchParams;
  const active = views.find((item) => item.id === view)?.id || "workshop";
  return (
    <InteriorFrame path="/factory" breadcrumbs={[{ label: "Factory" }]}>
      <PageMast eyebrow="Manufacturing" title="Inside the GRIMM workshop" text="Pump components, machining, electrical assembly and packaged equipment."
        image={{ src: factoryImages[0].src, alt: "Pump castings and components in the GRIMM factory" }} />
      <div className="interior-shell">
        <InteriorTabs label="Factory information" links={views.map(({ id, label, icon: Icon }) => ({ label, href: id === "workshop" ? "/factory" : `/factory?view=${id}`, current: active === id, icon: <Icon size={16} /> }))} />
        {active === "workshop" && <section className="interior-detail-panel">
          <SectionHeading eyebrow="Workshop" title="From components to assembled equipment" action={<Link className="interior-button" href="/testing" prefetch={false}><Gauge size={16} /> View factory testing</Link>} />
          <div className="interior-grid">
            {factoryImages.map((item) => <MediaCard key={item.src} title={item.title} image={item.src} text={item.text} />)}
          </div>
        </section>}
        {active === "videos" && <section className="interior-detail-panel">
          <SectionHeading title="Factory videos" />
          <div className="interior-grid">{videos.map((video) => <figure key={video.src}>
            <video className="interior-video" controls preload="none" src={video.src} poster={video.poster} aria-label={video.title} />
            <figcaption className="mt-2 font-extrabold">{video.title}</figcaption>
          </figure>)}</div>
        </section>}
        {active === "documents" && <section className="interior-detail-panel">
          <SectionHeading title="Water-system utility models" />
          <p className="interior-copy mb-4">These documents relate to water-treatment equipment, not fire-pump approvals.</p>
          <div className="interior-grid interior-grid-2">
            {waterSystemInnovationDocuments.map((item) => <MediaCard key={item.src} title={item.title} image={item.src} text={item.note} href={item.src} linkText="View document" contain />)}
          </div>
        </section>}
      </div>
      <InteriorBanner title="Certificates & attestations" href="/certificates" label="View documents" />
    </InteriorFrame>
  );
}
