import type { Metadata } from "next";
import { EngineeringTools } from "@/components/home/engineering-tools";
import { SimplePage } from "@/components/simple-page";
import { localizedAlternates } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Fire Pump Selector and Pump Power Calculator",
  description: "Use GRIMM fire pump selector and pump calculator to estimate flow, pressure, head and recommended fire pump configuration.",
  alternates: localizedAlternates("/tools/fire-pump-selector"),
};

export default function FirePumpSelectorPage() {
  return (
    <SimplePage
      eyebrow="Engineering Tools"
      title="Fire Pump Selector and pump power calculator."
      text="Convert early buyer interest into a concrete flow, pressure, application and product recommendation."
    >
      <EngineeringTools />
    </SimplePage>
  );
}
