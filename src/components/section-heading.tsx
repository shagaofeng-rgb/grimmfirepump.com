import type { ReactNode } from "react";

type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  text?: string;
  action?: ReactNode;
  light?: boolean;
};

export function SectionHeading({ eyebrow, title, text, action, light }: SectionHeadingProps) {
  return (
    <div className="container-shell mb-9 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
      <div className="max-w-3xl">
        <p className="eyebrow mb-3">{eyebrow}</p>
        <h2 className={`text-3xl font-black leading-tight tracking-normal md:text-[40px] ${light ? "text-white" : "text-[var(--navy-950)]"}`}>
          {title}
        </h2>
        {text ? <p className={`mt-4 max-w-2xl text-base leading-7 ${light ? "text-slate-300" : "text-slate-600"}`}>{text}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
