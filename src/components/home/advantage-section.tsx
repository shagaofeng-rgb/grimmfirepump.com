import { BadgeCheck, Factory, Gauge, Headset } from "lucide-react";

const inputs = [
  { value: "Factory", title: "Pump assembly", Icon: Factory },
  { value: "Testing", title: "Flow and pressure", Icon: Gauge },
  { value: "Documents", title: "Certificates and catalogs", Icon: BadgeCheck },
  { value: "Support", title: "Project inquiries", Icon: Headset },
];

export function AdvantageSection() {
  return (
    <section className="home-inputs">
      <div className="home-section-inner">
        <div className="home-input-grid">
          {inputs.map(({ value, title, Icon }) => (
            <article key={title}>
              <Icon size={30} strokeWidth={1.55} />
              <div><strong>{value}</strong><span className="home-input-label">{title}</span></div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
