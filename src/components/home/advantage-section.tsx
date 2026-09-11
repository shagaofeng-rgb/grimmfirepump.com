import { BadgeCheck, Factory, Globe2, Headset } from "lucide-react";

const inputs = [
  { value: "10+", title: "Years of Experience", Icon: BadgeCheck },
  { value: "50+", title: "Countries Served", Icon: Globe2 },
  { value: "1,000+", title: "Projects Delivered", Icon: Factory },
  { value: "24/7", title: "Technical Support", Icon: Headset },
];

export function AdvantageSection() {
  return (
    <section className="home-inputs">
      <div className="home-section-inner">
        <div className="home-input-grid">
          {inputs.map(({ value, title, Icon }) => (
            <article key={title}>
              <Icon size={30} strokeWidth={1.55} />
              <div><strong>{value}</strong><h3>{title}</h3></div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
