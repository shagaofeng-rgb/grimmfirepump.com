import Link from "next/link";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { DateRangeFilter } from "@/components/admin/date-range-filter";
import { AdminPageHeader, EmptyState, StatusPill, inputClass } from "@/components/admin/admin-widgets";
import { getSiteSettings, listAuditLogs } from "@/lib/admin-cms";
import { paginationPageSize, parsePositiveInt, resolveDateRange } from "@/lib/admin-listing";
import { readStore } from "@/lib/local-store";
import { paginate } from "@/lib/visitor-analytics";

export const dynamic = "force-dynamic";
type LoginLog = { id: string; createdAt: string; username: string; ip: string; success: boolean; reason: string; userAgent: string };
type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };
function value(params: Record<string, string | string[] | undefined>, key: string) { const item = params[key]; return Array.isArray(item) ? item[0] || "" : item || ""; }
function inRange(createdAt: string, from: string, to: string) { const date = Date.parse(createdAt); return (!from || date >= Date.parse(`${from}T00:00:00`)) && (!to || date <= Date.parse(`${to}T23:59:59.999`)); }

export default async function LogsPage({ searchParams }: Props) {
  const params = await searchParams;
  const settings = await getSiteSettings();
  const range = resolveDateRange(value(params, "range"), { from: value(params, "from"), to: value(params, "to"), timeZone: settings.timezone || "Asia/Shanghai" });
  const view = value(params, "view") === "login" ? "login" : "activity";
  const filters = { range: range.preset, from: range.from, to: range.to, view, query: value(params, "query"), result: value(params, "result") || "all" };
  const page = parsePositiveInt(value(params, "page"));
  const pageSize = paginationPageSize(value(params, "pageSize"));
  const [auditLogs, loginLogs] = await Promise.all([listAuditLogs(), readStore<LoginLog[]>("login-logs.json", [])]);
  const loginRecords = loginLogs.filter((item) => inRange(item.createdAt, range.from, range.to) && (!filters.query || [item.username, item.reason].join(" ").toLowerCase().includes(filters.query.toLowerCase())) && (filters.result === "all" || (filters.result === "success") === item.success)).sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  const activityRecords = auditLogs.filter((item) => inRange(item.createdAt, range.from, range.to) && (!filters.query || [item.actor, item.action, item.target].join(" ").toLowerCase().includes(filters.query.toLowerCase())) && (filters.result === "all" || item.result === filters.result)).sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  const pagedLogins = paginate(loginRecords, page, pageSize);
  const pagedActivity = paginate(activityRecords, page, pageSize);
  const pagination = view === "login" ? pagedLogins : pagedActivity;
  return <AdminShell><AdminPageHeader eyebrow="系统设置" title="网站记录" description="按时间范围查看后台操作记录与账号登录记录。" /><section className="mt-8 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"><div className="flex gap-2 border-b border-slate-200 px-4 pt-4"><Link href="/admin/logs?view=activity" className={`rounded-t-md px-4 py-2 text-sm font-black ${view === "activity" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600"}`}>操作记录</Link><Link href="/admin/logs?view=login" className={`rounded-t-md px-4 py-2 text-sm font-black ${view === "login" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600"}`}>登录记录</Link></div><form method="get" className="grid gap-3 border-b border-slate-200 bg-slate-50 p-4 md:grid-cols-4"><input type="hidden" name="view" value={view} /><div className="md:col-span-4"><DateRangeFilter pathname="/admin/logs" query={filters} preset={range.preset} from={range.from} to={range.to} /></div><input name="query" defaultValue={filters.query} className={inputClass} placeholder={view === "login" ? "搜索账号或登录原因" : "搜索操作人、动作或对象"} /><select name="result" defaultValue={filters.result} className={inputClass}><option value="all">全部结果</option><option value="success">成功</option><option value="failed">失败</option></select><select name="pageSize" defaultValue={String(pagination.pageSize)} className={inputClass}><option value="20">20 条 / 页</option><option value="25">25 条 / 页</option><option value="50">50 条 / 页</option><option value="100">100 条 / 页</option></select><button className="button button-primary min-h-11" type="submit">应用筛选</button></form><div className="overflow-x-auto"><table className="min-w-[760px] w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr>{(view === "login" ? ["账号", "结果", "原因", "时间"] : ["操作人", "操作", "对象", "结果", "时间"]).map((head) => <th key={head} className="px-5 py-3 font-black">{head}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{view === "login" ? pagedLogins.items.map((item) => <tr key={item.id}><td className="px-5 py-4 font-bold text-slate-900">{item.username}</td><td className="px-5 py-4"><StatusPill value={item.success ? "success" : "failed"} /></td><td className="px-5 py-4 text-slate-700">{item.reason}</td><td className="px-5 py-4 text-slate-600">{new Date(item.createdAt).toLocaleString("zh-CN")}</td></tr>) : pagedActivity.items.map((item) => <tr key={item.id}><td className="px-5 py-4 font-bold text-slate-900">{item.actor}</td><td className="px-5 py-4 text-slate-700">{item.action}</td><td className="px-5 py-4 text-slate-700">{item.target}</td><td className="px-5 py-4"><StatusPill value={item.result} /></td><td className="px-5 py-4 text-slate-600">{new Date(item.createdAt).toLocaleString("zh-CN")}</td></tr>)}</tbody></table>{!pagination.items.length ? <div className="p-5"><EmptyState text="当前筛选条件下没有记录。" /></div> : null}</div><AdminPagination pathname="/admin/logs" query={{ ...filters, pageSize: pagination.pageSize }} page={pagination.page} totalPages={pagination.totalPages} total={pagination.total} pageSize={pagination.pageSize} label="记录" /></section></AdminShell>;
}
