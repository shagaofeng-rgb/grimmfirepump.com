export function TrustStrip() {
  const items = [
    ["NFPA20-oriented configuration", "Project-ready package design"],
    ["Testing reports and certificates", "Quality documentation available"],
    ["Export support", "English catalog and fast response"],
  ];

  return (
    <section className="container-shell industrial-shadow grid overflow-hidden rounded-lg md:grid-cols-3">
      {items.map(([label, value]) => (
        <div key={label} className="border-b border-white/10 bg-[var(--navy-900)] p-5 md:border-b-0 md:border-r">
          <span className="text-sm text-slate-400">{label}</span>
          <strong className="mt-2 block text-base text-white">{value}</strong>
        </div>
      ))}
    </section>
  );
}
