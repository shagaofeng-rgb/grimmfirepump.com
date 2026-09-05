import { Factory, FilePenLine, Folder } from "lucide-react";

const items = [
  {
    title: "System configuration",
    text: "Match the pump discussion to the duty point, source condition and installation inputs.",
    Icon: FilePenLine,
  },
  {
    title: "Project documents",
    text: "Confirm the available information your team needs to review and coordinate.",
    Icon: Folder,
  },
  {
    title: "Factory & testing",
    text: "Review published manufacturing, assembly and testing evidence for the package.",
    Icon: Factory,
  },
];

export function FactoryPreviewSection() {
  return (
    <section className="home-practical">
      <div className="home-section-inner">
        <h2>Built for practical review.</h2>
        <div className="home-practical-grid">
          {items.map(({ title, text, Icon }) => (
            <article key={title}>
              <Icon size={47} strokeWidth={1.25} />
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
