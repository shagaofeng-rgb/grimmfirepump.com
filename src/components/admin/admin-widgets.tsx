import type { ReactNode } from "react";
import { Activity, BarChart3, Boxes, Download, FileText, FolderTree, Globe2, Image, Inbox, LayoutDashboard, ListChecks, MessageCircle, MousePointerClick, Newspaper, Search, Settings, ShieldCheck, Users } from "lucide-react";

const pageIcons: Record<string, typeof LayoutDashboard> = {
  "运营概览": LayoutDashboard, "工作台": LayoutDashboard, "客户线索": Inbox, "客户入口": FileText, "产品管理": Boxes,
  "产品分类": FolderTree, "产品知识库": FileText, "文章管理": Newspaper, "资讯发布": ListChecks,
  "素材库": Image, "下载资料": Download, "页面管理": FileText, "访问与转化数据": Activity,
  "WhatsApp 线索": MessageCircle, "搜索优化": Search, "账号管理": Users,
  "操作记录": ShieldCheck, "网站设置": Settings, "新闻分类统计": FolderTree,
  "新增产品": Boxes, "新增文章": Newspaper,
};

export function AdminPageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  const Icon = pageIcons[title] || (eyebrow.includes("设置") ? Settings : eyebrow.includes("访问") ? Globe2 : FileText);
  return (
    <div className="admin-page-header flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex min-w-0 items-start gap-4">
        <span className="admin-page-icon"><Icon size={23} strokeWidth={1.8} /></span>
        <div className="min-w-0">
          <p className="admin-page-context">{eyebrow}</p>
          <h1>{title}</h1>
          {description ? <p className="admin-page-description">{description}</p> : null}
        </div>
      </div>
      {action ? <div className="admin-page-action shrink-0">{action}</div> : null}
    </div>
  );
}

export function StatCard({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  const Icon = label.includes("WhatsApp") ? MessageCircle
    : label.includes("产品") ? Boxes
      : label.includes("访客") || label.includes("浏览") || label.includes("会话") ? Activity
        : label.includes("线索") || label.includes("询盘") ? Inbox
          : label.includes("转化") || label.includes("点击") ? MousePointerClick
            : label.includes("下载") ? Download
              : label.includes("文章") || label.includes("新闻") ? Newspaper : BarChart3;
  return (
    <div className="admin-stat-card rounded-lg bg-white p-5">
      <div className="admin-stat-top"><span>{label}</span><Icon size={19} strokeWidth={1.8} aria-hidden="true" /></div>
      <strong className="mt-3 block text-3xl font-black text-slate-950">{value}</strong>
      {hint ? <p className="mt-2 text-xs font-bold text-slate-400">{hint}</p> : null}
    </div>
  );
}

export function AdminCard({ title, children }: { title: string; children: ReactNode }) {
  const Icon = title.includes("来源") || title.includes("国家") ? Globe2
    : title.includes("客户") || title.includes("线索") ? Inbox
      : title.includes("访问") || title.includes("流量") ? Activity
        : title.includes("资料") || title.includes("下载") ? Download
          : title.includes("产品") ? Boxes
            : title.includes("文章") || title.includes("新闻") ? Newspaper
              : title.includes("账号") || title.includes("用户") ? Users : FileText;
  return (
    <section className="admin-card rounded-lg bg-white p-5 md:p-6">
      <h2 className="admin-card-heading"><Icon size={18} strokeWidth={1.8} aria-hidden="true" />{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export function EmptyState({ text }: { text: string }) {
  return <div className="admin-empty-state rounded-md border border-dashed border-slate-300 bg-slate-50 p-6 text-sm font-medium text-slate-500">{text}</div>;
}

export function StatusPill({ value }: { value: string }) {
  const labels: Record<string, string> = {
    published: "已发布",
    published_success: "已发布",
    success: "成功",
    active: "启用",
    disabled: "停用",
    running: "执行中",
    skipped: "已跳过",
    partial: "部分完成",
    ready: "可用",
    not_run: "未执行",
    draft: "草稿",
    review: "审核中",
    offline: "下架",
    archived: "归档",
    failed: "失败",
    new: "新询盘",
    pending: "待处理",
    contacted: "已联系",
    quoted: "已报价",
    following: "跟进中",
    negotiating: "洽谈中",
    won: "已成交",
    lost: "已丢单",
    invalid: "无效",
    spam: "垃圾",
    configured: "已配置",
    not_configured: "未接入",
    connected: "已接入",
  };
  const color =
    value === "published" || value === "published_success" || value === "success" || value === "active" || value === "configured" || value === "connected" || value === "ready"
      ? "bg-emerald-50 text-emerald-700"
      : value === "draft" || value === "not_configured" || value === "offline"
        ? "bg-slate-100 text-slate-600"
        : "bg-orange-50 text-orange-700";
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-black ${color}`}>{labels[value] || value}</span>;
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-2 text-sm font-black text-slate-700">
      {label}
      {children}
    </label>
  );
}

export const inputClass = "min-h-11 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400";
export const textareaClass = "rounded-md border border-slate-300 bg-white px-3 py-3 text-sm text-slate-900 placeholder:text-slate-400";
