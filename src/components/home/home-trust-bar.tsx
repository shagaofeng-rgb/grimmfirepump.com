import { BadgeCheck, ClipboardCheck, Factory, Headset } from "lucide-react";

const items = [
  { label: "ISO management systems", Icon: BadgeCheck },
  { label: "Documented project review", Icon: ClipboardCheck },
  { label: "Factory-built configurations", Icon: Factory },
  { label: "Direct engineering contact", Icon: Headset },
];

export function HomeTrustBar() {
  return (
    <section aria-label="GRIMM PUMP strengths" className="border-y border-slate-200 bg-white">
      <div className="mx-auto grid max-w-[1360px] divide-y divide-slate-200 px-5 sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4 lg:px-8">
        {items.map(({ label, Icon }) => (
          <div key={label} className="flex min-h-16 items-center justify-center gap-3 px-4 py-4 text-center text-sm font-bold text-slate-700">
            <Icon className="shrink-0 text-[var(--orange)]" size={19} strokeWidth={2} />
            <span>{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
