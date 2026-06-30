import type { Metadata } from "next";
import { ApplicationSection } from "@/components/home/application-section";
import { SimplePage } from "@/components/simple-page";

export const metadata: Metadata = {
  title: "Fire Pump Applications by Facility and Industry",
  description: "Explore fire pump solutions for warehouses, data centers, airports, hospitals, oil and gas projects, industrial plants and commercial buildings.",
  alternates: { canonical: "/applications" },
};

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
