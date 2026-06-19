import { AdminShell } from "@/components/admin/admin-shell";
import { downloads } from "@/data/site";
import { getAdminData } from "@/lib/admin-data";

export const dynamic = "force-dynamic";

export default async function AdminDownloadsPage() {
  const { downloadLeads } = await getAdminData();

  return (
    <AdminShell>
      <p className="text-sm font-black uppercase tracking-[0.14em] text-orange-300">Downloads</p>
      <h1 className="mt-3 text-4xl font-black text-white">Catalog gate performance</h1>
      <div className="mt-8 grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-lg border border-white/10 bg-white/[0.04] p-6">
          <h2 className="text-xl font-black text-white">Download assets</h2>
          <div className="mt-5 grid gap-3">
            {downloads.map((item) => (
              <div key={item.title} className="rounded-md bg-slate-900 p-4">
                <strong>{item.title}</strong>
                <p className="mt-2 text-sm leading-6 text-slate-400">{item.text}</p>
              </div>
            ))}
          </div>
        </section>
        <section className="rounded-lg border border-white/10 bg-white/[0.04] p-6">
          <h2 className="text-xl font-black text-white">Download leads</h2>
          <div className="mt-5 grid gap-3">
            {downloadLeads.map((lead) => (
              <div key={lead.id} className="rounded-md bg-slate-900 p-4">
                <div className="flex justify-between gap-4">
                  <strong>{lead.name}</strong>
                  <span className="text-sm text-orange-300">{lead.country || "Country TBD"}</span>
                </div>
                <p className="mt-2 text-sm text-slate-400">{lead.assetTitle} · {lead.email}</p>
              </div>
            ))}
            {!downloadLeads.length ? <p className="text-sm text-slate-500">No download leads yet.</p> : null}
          </div>
        </section>
      </div>
    </AdminShell>
  );
}
