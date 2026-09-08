import Link from "next/link";
import { ArrowLeft, Globe2, Mail, MousePointerClick, Route, UserRound } from "lucide-react";
import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { DateRangeFilter } from "@/components/admin/date-range-filter";
import { AdminCard, AdminPageHeader, EmptyState, StatCard } from "@/components/admin/admin-widgets";
import { getAdminData } from "@/lib/admin-data";
import { paginationPageSize, parsePositiveInt, resolveDateRange } from "@/lib/admin-listing";
import { getSiteSettings } from "@/lib/admin-cms";
import { getVisitorProfile, getVisitorSessions, paginate, type AnalyticsFilters } from "@/lib/visitor-analytics";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ visitorId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function value(params: Record<string, string | string[] | undefined>, key: string) {
  const current = params[key];
  return Array.isArray(current) ? current[0] || "" : current || "";
}

function stamp(value: string) {
  return new Intl.DateTimeFormat("zh-CN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export default async function VisitorDetailPage({ params, searchParams }: Props) {
  const [{ visitorId }, raw] = await Promise.all([params, searchParams]);
  const settings = await getSiteSettings();
  const range = resolveDateRange(value(raw, "range"), {
    from: value(raw, "from"),
    to: value(raw, "to"),
    timeZone: settings.timezone || "Asia/Shanghai",
  });
  const filters: AnalyticsFilters = { from: range.from, to: range.to, traffic: "real" };
  const page = parsePositiveInt(value(raw, "page"));
  const pageSize = paginationPageSize(value(raw, "pageSize"));
  const { events, inquiries, downloadLeads } = await getAdminData();
  const profile = getVisitorProfile(events, visitorId, filters);
  if (!profile) notFound();

  const sessions = getVisitorSessions(events, visitorId, filters);
  const pagedSessions = paginate(sessions, page, pageSize);
  const relatedInquiries = inquiries.filter((item) => item.visitorId === visitorId || Boolean(item.sessionId && sessions.some((session) => session.sessionId === item.sessionId)));
  const relatedDownloads = downloadLeads.filter((lead) => relatedInquiries.some((inquiry) => inquiry.email && inquiry.email === lead.email));
  const query = { range: range.preset, from: range.from, to: range.to, pageSize: String(pagedSessions.pageSize) };

  return (
    <AdminShell>
      <Link href="/admin/analytics" className="inline-flex items-center gap-2 text-sm font-black text-orange-700"><ArrowLeft size={16} /> 返回访问分析</Link>
      <AdminPageHeader eyebrow="访客访问档案" title={\`匿名访客 \${profile.visitorId.slice(0, 12)}\`} description="同一浏览器第一方访客 ID 下的访问、会话、行为与已关联线索。跨设备或未验证的身份不会被强行合并。" />

      <section className="mt-7 rounded-xl bg-[#091b32] p-5 text-white shadow-[0_20px_60px_rgba(15,23,42,0.18)]">
        <DateRangeFilter pathname={\`/admin/analytics/visitors/\${encodeURIComponent(visitorId)}\`} query={query} preset={range.preset} from={range.from} to={range.to} />
        <form method="get" className="mt-3 flex justify-end gap-2">
          <input type="hidden" name="range" value="custom" />
          <input type="hidden" name="from" value={range.from} />
          <input type="hidden" name="to" value={range.to} />
          <button className="rounded-md bg-white px-4 py-2 text-sm font-black text-slate-900" type="submit">应用时间范围</button>
        </form>
      </section>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard label="首次访问" value={stamp(profile.firstSeenAt)} />
        <StatCard label="最近访问" value={stamp(profile.lastSeenAt)} />
        <StatCard label="访问次数" value={profile.visits} hint={\`\${profile.sessions} 个会话\`} />
        <StatCard label="页面浏览" value={profile.pageViews} hint={\`\${profile.conversions} 个转化动作\`} />
        <StatCard label="最新来源" value={profile.channel} hint={\`\${profile.country} · \${profile.ipMasked || "IP 已隐藏"}\`} />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <AdminCard title="客户归属与识别状态">
          <div className="grid gap-4 text-sm leading-6 text-slate-600">
            <div className="flex items-start gap-3 rounded-md bg-slate-50 p-4"><UserRound className="mt-0.5 text-orange-700" size={18} /><div><strong className="block text-slate-900">匿名访客档案</strong>由本站第一方 visitor ID 归并同一浏览器访问。</div></div>
            <div className="flex items-start gap-3 rounded-md bg-slate-50 p-4"><Globe2 className="mt-0.5 text-orange-700" size={18} /><div><strong className="block text-slate-900">最近地理与来源</strong>{profile.country} · {profile.channel} · 脱敏 IP {profile.ipMasked || "不可用"}。</div></div>
            <div className="flex items-start gap-3 rounded-md bg-slate-50 p-4"><Mail className="mt-0.5 text-orange-700" size={18} /><div><strong className="block text-slate-900">已关联客户记录</strong>{relatedInquiries.length ? \`\${relatedInquiries.length} 条询盘已关联，可在客户询盘中继续跟进。\` : "尚未关联询盘。提交表单并携带 visitor ID 后会自动关联。"}</div></div>
          </div>
        </AdminCard>
        <AdminCard title="关键页面与行为">
          <div className="grid gap-3">
            {profile.paths.slice(0, 8).map((path) => <div key={path} className="flex items-center gap-2 rounded-md bg-slate-50 p-3 text-sm font-bold text-slate-700"><Route size={15} className="text-orange-700" /><span className="truncate">{path}</span></div>)}
            {!profile.paths.length ? <EmptyState text="当前时间范围内没有页面浏览记录。" /> : null}
          </div>
        </AdminCard>
      </div>

      <section className="mt-8 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-5"><p className="text-sm font-black text-orange-700">访问路径</p><h2 className="mt-1 text-xl font-black text-slate-950">按会话展开的完整旅程</h2></div>
        <div className="grid gap-4 p-5">
          {pagedSessions.items.map((session) => (
            <article key={session.sessionId} className="rounded-lg border border-slate-200 p-4">
              <div className="flex flex-col gap-3 border-b border-slate-100 pb-3 md:flex-row md:items-center md:justify-between">
                <div><strong className="text-slate-950">{stamp(session.startedAt)} 至 {stamp(session.endedAt)}</strong><p className="mt-1 text-sm text-slate-500">{session.country} · {session.channel} · {session.eventCount} 个行为</p></div>
                <span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">{session.entryPath} → {session.exitPath}</span>
              </div>
              <ol className="mt-4 grid gap-3 border-l-2 border-orange-200 pl-4">
                {session.events.map((event) => (
                  <li key={event.id} className="relative text-sm">
                    <span className="absolute -left-[22px] top-1.5 h-2.5 w-2.5 rounded-full bg-orange-500" />
                    <div className="flex flex-wrap items-center gap-2"><strong className="text-slate-900">{event.path || "/"}</strong><span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600"><MousePointerClick className="mr-1 inline" size={12} />{event.event}</span><time className="text-xs text-slate-500">{stamp(event.createdAt)}</time></div>
                    {event.label ? <p className="mt-1 text-xs text-slate-500">{event.label}</p> : null}
                  </li>
                ))}
              </ol>
            </article>
          ))}
          {!pagedSessions.items.length ? <EmptyState text="当前时间范围内没有访问会话。" /> : null}
        </div>
        <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <span>第 {pagedSessions.page} / {pagedSessions.totalPages} 页，共 {pagedSessions.total} 个会话</span>
          <div className="flex gap-2">
            <Link aria-disabled={pagedSessions.page <= 1} className="rounded-md border border-slate-200 px-3 py-2 font-bold aria-disabled:pointer-events-none aria-disabled:opacity-40" href={\`?range=\${range.preset}&from=\${range.from}&to=\${range.to}&page=\${pagedSessions.page - 1}&pageSize=\${pagedSessions.pageSize}\`}>上一页</Link>
            <Link aria-disabled={pagedSessions.page >= pagedSessions.totalPages} className="rounded-md border border-slate-200 px-3 py-2 font-bold aria-disabled:pointer-events-none aria-disabled:opacity-40" href={\`?range=\${range.preset}&from=\${range.from}&to=\${range.to}&page=\${pagedSessions.page + 1}&pageSize=\${pagedSessions.pageSize}\`}>下一页</Link>
          </div>
        </div>
      </section>

      {(relatedInquiries.length || relatedDownloads.length) ? <section className="mt-8 grid gap-6 xl:grid-cols-2"><AdminCard title="已关联询盘"><div className="grid gap-3">{relatedInquiries.map((lead) => <Link key={lead.id} href="/admin/leads" className="rounded-md bg-slate-50 p-3 text-sm hover:bg-orange-50"><strong className="block text-slate-900">{lead.name || lead.email}</strong><span className="text-slate-500">{lead.company || "—"} · {lead.product || "General inquiry"}</span></Link>)}</div></AdminCard><AdminCard title="已关联下载"><div className="grid gap-3">{relatedDownloads.map((lead) => <div key={lead.id} className="rounded-md bg-slate-50 p-3 text-sm"><strong className="block text-slate-900">{lead.assetTitle}</strong><span className="text-slate-500">{lead.name} · {stamp(lead.createdAt)}</span></div>)}</div></AdminCard></section> : null}
    </AdminShell>
  );
}
