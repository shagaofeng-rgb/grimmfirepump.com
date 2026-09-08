import Link from "next/link";
import { AdminShell } from "@/components/admin/admin-shell";
import { DateRangeFilter } from "@/components/admin/date-range-filter";
import { AdminPageHeader, EmptyState, StatusPill } from "@/components/admin/admin-widgets";
import { getSiteSettings, listAuditLogs } from "@/lib/admin-cms";
import { paginationPageSize, parsePositiveInt, resolveDateRange } from "@/lib/admin-listing";
import { readStore } from "@/lib/local-store";
import { paginate } from "@/lib/visitor-analytics";

export const dynamic = "force-dynamic";

type LoginLog = { id: string; createdAt: string; username: string; ip: string; success: boolean; reason: string; userAgent: string };
type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

function value(params: Record<string, string | string[] | undefined>, key: string) {
  const item = params[key];
  return Array.isArray(item) ? item[0] || "" : item || "";
}

function queryFor(values: Record<string, string | number | undefined>) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(values)) if (value) query.set(key, String(value));
  return `/admin/logs?${query.toString()}`;
}

function inRange(createdAt: string, from: string, to: string) {
  const date = Date.parse(createdAt);
  return (!from || date >= Date.parse(from + "T00:00:00")) && (!to || date <= Date.parse(to + "T23:59:59.999"));
}

export default async function LogsPage({ searchParams }: Props) {
  const params = await searchParams;
  const settings = await getSiteSettings();
  const range = resolveDateRange(value(params, "range"), { from: value(params, "from"), to: value(params, "to"), timeZone: settings.timezone || "Asia/Shanghai" });
  const query = value(params, "query").toLowerCase();
  const result = value(params, "result") || "all";
  const page = parsePositiveInt(value(params, "page"));
  const pageSize = paginationPageSize(value(params, "pageSize"));
  const [auditLogs, loginLogs] = await Promise.all([listAuditLogs(), readStore<LoginLog[]>("login-logs.json", [])]);
  const filteredLogins = loginLogs.filter((log) => inRange(log.createdAt, range.from, range.to) && (!query || [log.username, log.ip, log.reason, log.userAgent].join(" ").toLowerCase().includes(query)) && (result === "all" || (result === "success") === log.success)).sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  const filteredAudits = auditLogs.filter((log) => inRange(log.createdAt, range.from, range.to) && (!query || [log.actor, log.action, log.target, log.result].join(" ").toLowerCase().includes(query)) && (result === "all" || log.result === result)).sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  const pagedLogins = paginate(filteredLogins, page, pageSize);
  const pagedAudits = paginate(filteredAudits, page, pageSize);
  const base = { range: range.preset, from: range.from, to: range.to, query, result, pageSize: String(pageSize) };

  return (
    <AdminShell>
      <AdminPageHeader eyebrow="操作日志" title="登录日志和后台审计记录" description="按统一时间范围筛选登录、内容、产品、线索、媒体、SEO 和设置修改；所有记录均可分页追溯。" />
      <section className="mt-8 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <form method="get" className="grid gap-3 xl:grid-cols-[1.4fr_repeat(3,minmax(0,1fr))]">
          <DateRangeFilter pathname="/admin/logs" query={base} preset={range.preset} from={range.from} to={range.to} compact />
          <input name="query" defaultValue={query} className="min-h-11 rounded-md border border-slate-300 px-3 text-sm" placeholder="操作人、账号、IP、目标、原因..." />
          <select name="result" defaultValue={result} className="min-h-11 rounded-md border border-slate-300 px-3 text-sm"><option value="all">全部结果</option><option value="success">成功</option><option value="failed">失败</option></select>
          <div className="flex gap-2"><select name="pageSize" defaultValue={String(pageSize)} className="min-h-11 flex-1 rounded-md border border-slate-300 px-3 text-sm"><option value="20">20 / 页</option><option value="25">25 / 页</option><option value="50">50 / 页</option><option value="100">100 / 页</option></select><button className="button button-primary" type="submit">应用筛选</button></div>
        </form>
      </section>
      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-200 p-5"><h2 className="text-xl font-black text-slate-950">登录日志</h2><p className="mt-1 text-sm text-slate-500">共 {pagedLogins.total} 条</p></div><div className="grid gap-3 p-5">{pagedLogins.items.map((log) => <div key={log.id} className="rounded-md bg-slate-50 p-3 text-sm"><div className="flex justify-between gap-3"><strong>{log.username}</strong><StatusPill value={log.success ? "success" : "failed"} /></div><p className="mt-1 text-slate-500">{log.ip} · {log.reason} · {new Date(log.createdAt).toLocaleString()}</p></div>)}{!pagedLogins.items.length ? <EmptyState text="当前筛选条件下没有登录记录。" /> : null}</div></section>
        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-200 p-5"><h2 className="text-xl font-black text-slate-950">操作日志</h2><p className="mt-1 text-sm text-slate-500">共 {pagedAudits.total} 条</p></div><div className="grid gap-3 p-5">{pagedAudits.items.map((log) => <div key={log.id} className="rounded-md bg-slate-50 p-3 text-sm"><div className="flex justify-between gap-3"><strong>{log.action}</strong><StatusPill value={log.result} /></div><p className="mt-1 text-slate-500">{log.actor} · {log.target} · {new Date(log.createdAt).toLocaleString()}</p></div>)}{!pagedAudits.items.length ? <EmptyState text="当前筛选条件下没有操作记录。" /> : null}</div></section>
      </div>
      <div className="mt-5 flex items-center justify-between text-sm text-slate-600"><span>第 {Math.max(pagedLogins.page, pagedAudits.page)} 页</span><div className="flex gap-2"><Link aria-disabled={page <= 1} className="rounded-md border border-slate-200 px-3 py-2 font-bold aria-disabled:pointer-events-none aria-disabled:opacity-40" href={queryFor({ ...base, page: page - 1 })}>上一页</Link><Link aria-disabled={page >= Math.max(pagedLogins.totalPages, pagedAudits.totalPages)} className="rounded-md border border-slate-200 px-3 py-2 font-bold aria-disabled:pointer-events-none aria-disabled:opacity-40" href={queryFor({ ...base, page: page + 1 })}>下一页</Link></div></div>
    </AdminShell>
  );
}
