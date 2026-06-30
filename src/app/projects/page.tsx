import type { Metadata } from "next";
import { ProjectMapSection } from "@/components/home/project-map";
import { SimplePage } from "@/components/simple-page";

export const metadata: Metadata = {
  title: "Global Fire Pump Project Cases",
  description: "Review GRIMM fire pump project cases by region, industry, product configuration and delivery evidence for overseas buyers.",
  alternates: { canonical: "/projects" },
};

export default function ProjectsPage() {
  return (
    <SimplePage
      eyebrow="Projects"
      title="Global fire pump project proof system."
      text="Case pages should include country, industry, product model, project background, technical configuration and real delivery photos."
    >
      <ProjectMapSection />
    </SimplePage>
  );
}
