import { ClipboardList, FileCheck2, Send, Settings2 } from "lucide-react";

const steps = [
  { number: "01", title: "Share project inputs", text: "Send the duty point, water source and available drive conditions.", Icon: ClipboardList },
  { number: "02", title: "Review configuration", text: "Align the pump arrangement with the stated project requirements.", Icon: Settings2 },
  { number: "03", title: "Confirm documentation", text: "Identify the drawings, data and available review documents needed.", Icon: FileCheck2 },
  { number: "04", title: "Send inquiry", text: "Move forward with a focused technical and commercial discussion.", Icon: Send },
];

export function ProjectPath() {
  return (
    <section className="home-paper-section">
      <div className="container-shell py-20 md:py-24">
        <div className="max-w-3xl">
          <p className="home-kicker">A clearer route to review</p>
          <h2 className="home-display mt-3 text-3xl leading-tight text-[var(--navy-950)] md:text-[48px]">
            From project brief to configured pump system.
          </h2>
        </div>

        <ol className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {steps.map(({ number, title, text, Icon }) => (
            <li key={number} className="home-process-step">
              <div className="flex items-center justify-between">
                <span className="home-step-number">{number}</span>
                <Icon size={25} strokeWidth={1.55} className="text-[var(--orange)]" />
              </div>
              <h3 className="mt-8 text-lg font-black text-[var(--navy-950)]">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
