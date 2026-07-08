import type { ReactNode } from "react";

export function AdminPageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="text-sm font-black uppercase tracking-[0.14em] text-orange-600">{eyebrow}</p>
        <h1 className="mt-3 text-3xl font-black text-slate-950 md:text-4xl">{title}</h1>
        {description ? <p className="mt-3 max-w-3xl leading-7 text-slate-600">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function StatCard({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <span className="text-sm font-bold text-slate-500">{label}</span>
      <strong className="mt-3 block text-3xl font-black text-slate-950">{value}</strong>
      {hint ? <p className="mt-2 text-xs font-bold text-slate-400">{hint}</p> : null}
    </div>
  );
}

export function AdminCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-black text-slate-950">{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export function EmptyState({ text }: { text: string }) {
  return <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-6 text-sm font-bold text-slate-500">{text}</div>;
}

export function StatusPill({ value }: { value: string }) {
  const color = value === "published" || value === "success" || value === "active" ? "bg-emerald-50 text-emerald-700" : value === "draft" ? "bg-slate-100 text-slate-600" : "bg-orange-50 text-orange-700";
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-black ${color}`}>{value}</span>;
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-2 text-sm font-black text-slate-700">
      {label}
      {children}
    </label>
  );
}

export const inputClass = "min-h-11 rounded-md border border-slate-300 px-3 text-sm";
export const textareaClass = "rounded-md border border-slate-300 px-3 py-3 text-sm";
