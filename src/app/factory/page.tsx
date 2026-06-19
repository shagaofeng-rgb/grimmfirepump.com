import { CertificateSection } from "@/components/home/certificate-section";
import { FactorySection } from "@/components/home/factory-section";
import { VideoSection } from "@/components/home/video-section";
import { SimplePage } from "@/components/simple-page";

export default function FactoryPage() {
  return (
    <SimplePage
      eyebrow="Factory Capability"
      title="Manufacturing strength for pump packages and export projects."
      text="Show production, assembly, testing, quality control, certificates and factory video as one continuous trust story."
    >
      <FactorySection />
      <CertificateSection />
      <VideoSection />
    </SimplePage>
  );
}
