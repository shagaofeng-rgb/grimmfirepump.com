import { AdminShell } from "@/components/admin/admin-shell";
import { getAdminData } from "@/lib/admin-data";

export const dynamic = "force-dynamic";

export default async function AdminInquiriesPage() {
  const { inquiries } = await getAdminData();

  return (
    <AdminShell>
      <p className="text-sm font-black uppercase tracking-[0.14em] text-orange-300">Inquiries</p>
      <h1 className="mt-3 text-4xl font-black text-white">Sales lead inbox</h1>
      <div className="mt-8 overflow-hidden rounded-lg border border-white/10">
        <table className="w-full min-w-[980px] text-left text-sm">
          <thead className="bg-white/[0.06] text-slate-300">
            <tr>
              {["Score", "Stage", "Name", "Email", "Product", "Flow", "Head", "Certification", "Country", "Created"].map((head) => (
                <th key={head} className="px-4 py-3 font-black">{head}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {inquiries.map((item) => (
              <tr key={item.id} className="border-t border-white/10">
                <td className="px-4 py-4 font-black text-orange-300">{item.score}</td>
                <td className="px-4 py-4">{item.stage}</td>
                <td className="px-4 py-4">{item.name}</td>
                <td className="px-4 py-4">{item.email}</td>
                <td className="px-4 py-4">{item.product}</td>
                <td className="px-4 py-4">{item.flow}</td>
                <td className="px-4 py-4">{item.head}</td>
                <td className="px-4 py-4">{item.certification}</td>
                <td className="px-4 py-4">{item.country}</td>
                <td className="px-4 py-4">{new Date(item.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!inquiries.length ? <p className="p-6 text-sm text-slate-500">No inquiries yet.</p> : null}
      </div>
    </AdminShell>
  );
}
