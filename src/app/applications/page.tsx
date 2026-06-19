import { ApplicationSection } from "@/components/home/application-section";
import { SimplePage } from "@/components/simple-page";

export default function ApplicationsPage() {
  return (
    <SimplePage
      eyebrow="Applications"
      title="Fire pump solutions by facility and industry."
      text="Application pages map project risks, water supply conditions and recommended fire pump configurations for each buyer scenario."
    >
      <ApplicationSection />
    </SimplePage>
  );
}
