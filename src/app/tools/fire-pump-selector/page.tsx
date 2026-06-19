import { EngineeringTools } from "@/components/home/engineering-tools";
import { SimplePage } from "@/components/simple-page";

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
