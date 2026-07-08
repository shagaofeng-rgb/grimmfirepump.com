import { AdminShell } from "@/components/admin/admin-shell";
import { AdminPageHeader, StatusPill } from "@/components/admin/admin-widgets";
import { listAuditLogs } from "@/lib/admin-cms";
import { readStore } from "@/lib/local-store";

export const dynamic = "force-dynamic";

type LoginLog = { id: string; createdAt: string; username: string; ip: string; success: boolean; reason: string; userAgent: string };

export default async function LogsPage() {
  const [auditLogs, loginLogs] = await Promise.all([listAuditLogs(), readStore<LoginLog[]>("login-logs.json", [])]);
  return (
    <AdminShell>
      <AdminPageHeader eyebrow="操作日志" title="登录日志和后台审计记录" description="记录登录、退出、产品/新闻/线索/媒体/SEO/设置修改。敏感字段不会明文写入日志。" />
      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black text-slate-950">登录日志</h2>
          <div className="mt-4 grid gap-3">{loginLogs.slice(0, 30).map((log) => <div key={log.id} className="rounded-md bg-slate-50 p-3 text-sm"><div className="flex justify-between gap-3"><strong>{log.username}</strong><StatusPill value={log.success ? "success" : "failed"} /></div><p className="mt-1 text-slate-500">{log.ip} · {log.reason} · {new Date(log.createdAt).toLocaleString()}</p></div>)}</div>
        </section>
        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black text-slate-950">操作日志</h2>
          <div className="mt-4 grid gap-3">{auditLogs.slice(0, 50).map((log) => <div key={log.id} className="rounded-md bg-slate-50 p-3 text-sm"><div className="flex justify-between gap-3"><strong>{log.action}</strong><StatusPill value={log.result} /></div><p className="mt-1 text-slate-500">{log.actor} · {log.target} · {new Date(log.createdAt).toLocaleString()}</p></div>)}</div>
        </section>
      </div>
    </AdminShell>
  );
}
