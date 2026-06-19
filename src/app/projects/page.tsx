import { ProjectMapSection } from "@/components/home/project-map";
import { SimplePage } from "@/components/simple-page";

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
