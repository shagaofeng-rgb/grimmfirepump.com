import { AdminShell } from "@/components/admin/admin-shell";
import { getAdminData } from "@/lib/admin-data";

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  const { events, eventCounts } = await getAdminData();

  return (
    <AdminShell>
      <p className="text-sm font-black uppercase tracking-[0.14em] text-orange-300">Analytics</p>
      <h1 className="mt-3 text-4xl font-black text-white">CTA and funnel events</h1>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {["inquiry_submit", "download_click", "whatsapp_click"].map((event) => (
          <div key={event} className="rounded-lg border border-white/10 bg-white/[0.04] p-6">
            <span className="text-sm font-bold text-slate-400">{event}</span>
            <strong className="mt-3 block text-4xl font-black text-white">{eventCounts[event] || 0}</strong>
          </div>
        ))}
      </div>
      <section className="mt-8 rounded-lg border border-white/10 bg-white/[0.04] p-6">
        <h2 className="text-xl font-black text-white">Recent events</h2>
        <div className="mt-5 grid gap-3">
          {events.slice(0, 30).map((item) => (
            <div key={item.id} className="grid gap-2 rounded-md bg-slate-900 p-4 text-sm md:grid-cols-[180px_1fr_1fr]">
              <strong className="text-orange-300">{item.event}</strong>
              <span className="text-slate-300">{item.label || "No label"}</span>
              <span className="text-slate-500">{new Date(item.createdAt).toLocaleString()}</span>
            </div>
          ))}
          {!events.length ? <p className="text-sm text-slate-500">No events yet.</p> : null}
        </div>
      </section>
    </AdminShell>
  );
}
