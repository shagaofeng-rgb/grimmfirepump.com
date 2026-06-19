import Link from "next/link";
import { AdminShell } from "@/components/admin/admin-shell";
import { getAdminData } from "@/lib/admin-data";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const data = await getAdminData();
  const cards = [
    ["Inquiries", data.totals.inquiries, "/admin/inquiries"],
    ["Download Leads", data.totals.downloadLeads, "/admin/downloads"],
    ["Tracked Events", data.totals.events, "/admin/analytics"],
    ["Products", data.totals.products, "/admin/products"],
    ["Knowledge Posts", data.totals.posts, "/knowledge"],
    ["Project Cases", data.totals.projects, "/projects"],
  ];

  return (
    <AdminShell>
      <p className="text-sm font-black uppercase tracking-[0.14em] text-orange-300">Dashboard</p>
      <h1 className="mt-3 text-4xl font-black text-white">Lead generation control center</h1>
      <p className="mt-4 max-w-3xl leading-7 text-slate-400">
        This local dashboard proves the operating model: inquiries, gated downloads and CTA events are captured before connecting Supabase, Resend and PostHog.
      </p>
      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map(([label, value, href]) => (
          <Link key={label} href={String(href)} className="rounded-lg border border-white/10 bg-white/[0.04] p-6 hover:bg-white/[0.08]">
            <span className="text-sm font-bold text-slate-400">{label}</span>
            <strong className="mt-3 block text-4xl font-black text-white">{value}</strong>
          </Link>
        ))}
      </div>
      <div className="mt-8 grid gap-5 xl:grid-cols-2">
        <section className="rounded-lg border border-white/10 bg-white/[0.04] p-6">
          <h2 className="text-xl font-black text-white">Recent inquiries</h2>
          <div className="mt-5 grid gap-3">
            {data.inquiries.slice(0, 5).map((item) => (
              <div key={item.id} className="rounded-md bg-slate-900 p-4">
                <div className="flex items-center justify-between gap-4">
                  <strong>{item.name}</strong>
                  <span className="rounded-full bg-orange-400 px-2 py-1 text-xs font-black text-slate-950">{item.score}</span>
                </div>
                <p className="mt-2 text-sm text-slate-400">{item.product || "Product TBD"} · {item.country || "Country TBD"}</p>
              </div>
            ))}
            {!data.inquiries.length ? <p className="text-sm text-slate-500">No inquiries yet. Submit the contact form to test the flow.</p> : null}
          </div>
        </section>
        <section className="rounded-lg border border-white/10 bg-white/[0.04] p-6">
          <h2 className="text-xl font-black text-white">Event counts</h2>
          <div className="mt-5 grid gap-3">
            {Object.entries(data.eventCounts).map(([event, count]) => (
              <div key={event} className="flex justify-between rounded-md bg-slate-900 p-4 text-sm">
                <span className="font-bold">{event}</span>
                <span className="text-orange-300">{count}</span>
              </div>
            ))}
            {!Object.keys(data.eventCounts).length ? <p className="text-sm text-slate-500">No tracked events yet.</p> : null}
          </div>
        </section>
      </div>
    </AdminShell>
  );
}
