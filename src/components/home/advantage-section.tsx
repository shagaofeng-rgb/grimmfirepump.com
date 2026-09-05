import { Droplets, Gauge, Waves, Zap } from "lucide-react";

const inputs = [
  { title: "Flow", Icon: Waves },
  { title: "Head", Icon: Gauge },
  { title: "Power", Icon: Zap },
  { title: "Water source", Icon: Droplets },
];

export function AdvantageSection() {
  return (
    <section className="home-inputs">
      <div className="home-section-inner">
        <h2>Start with the inputs that shape the package.</h2>
        <div className="home-input-grid">
          {inputs.map(({ title, Icon }) => (
            <article key={title}>
              <Icon size={43} strokeWidth={1.35} />
              <h3>{title}</h3>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
