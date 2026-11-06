import type { Metadata } from "next";
import { MediaCard } from "@/components/interior/content";
import { InteriorFrame, PageMast, SectionHeading } from "@/components/interior/frame";
import { applications } from "@/data/site";
import { localizedAlternates } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Fire Pump Applications by Facility and Industry",
  description: "Explore fire pump solutions for warehouses, data centers, airports, hospitals, oil and gas projects, industrial plants and commercial buildings.",
  alternates: localizedAlternates("/applications"),
};

export default function ApplicationsPage() {
  return (
    <InteriorFrame path="/applications" breadcrumbs={[{ label: "Applications" }]}>
      <PageMast eyebrow="Industries" title="Fire protection by application" text="Review fire-water equipment for facility types and project conditions." />
      <section className="interior-shell interior-band">
        <SectionHeading title="Industries" />
        <div className="interior-grid">
          {applications.map(({ slug, title, image, text, icon: Icon }) => <MediaCard key={slug} title={title} image={image} text={text} icon={<Icon size={19} />} href={`/applications/${slug}`} linkText="View application" />)}
        </div>
      </section>
    </InteriorFrame>
  );
}
