import { ClipboardPenLine, Folder, MonitorCog, Send } from "lucide-react";

const steps = [
  { number: "01", title: "Share project inputs", Icon: ClipboardPenLine },
  { number: "02", title: "Review configuration", Icon: MonitorCog },
  { number: "03", title: "Confirm documentation", Icon: Folder },
  { number: "04", title: "Send inquiry", Icon: Send },
];

export function ProjectPath() {
  return (
    <section className="home-process">
      <div className="home-section-inner">
        <h2>From project brief to configured pump system.</h2>
        <ol className="home-process-grid">
          {steps.map(({ number, title, Icon }) => (
            <li key={number}>
              <div className="home-process-number"><span>{number}</span></div>
              <Icon className="home-process-icon" size={48} strokeWidth={1.35} />
              <h3>{title}</h3>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
