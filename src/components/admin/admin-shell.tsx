import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";
import {
  BarChart3,
  Boxes,
  Download,
  FileText,
  FolderTree,
  Home,
  Image as ImageIcon,
  Inbox,
  ListChecks,
  LayoutDashboard,
  Lock,
  MessageCircle,
  Newspaper,
  ScrollText,
  Settings,
  Users,
} from "lucide-react";
import { company } from "@/data/site";
import { getCurrentAdmin, type AdminRole } from "@/lib/admin-auth";
import { getAdminData } from "@/lib/admin-data";

const allRoles: AdminRole[] = ["super_admin", "content_manager", "product_manager", "sales", "analyst"];
const adminNav: Array<{ label: string; href: string; icon: typeof LayoutDashboard; roles: AdminRole[]; group: string }> = [
  { label: "工作台", href: "/admin/dashboard", icon: LayoutDashboard, roles: allRoles, group: "工作台" },
  { label: "客户线索", href: "/admin/leads", icon: Inbox, roles: ["super_admin", "sales"], group: "客户与销售" },
  { label: "客户入口", href: "/admin/forms", icon: FileText, roles: ["super_admin", "sales"], group: "客户与销售" },
  { label: "产品管理", href: "/admin/products", icon: Boxes, roles: ["super_admin", "product_manager"], group: "网站内容" },
  { label: "产品分类", href: "/admin/product-categories", icon: FolderTree, roles: ["super_admin", "product_manager"], group: "网站内容" },
  { label: "产品知识库", href: "/admin/product-knowledge", icon: ScrollText, roles: ["super_admin", "product_manager"], group: "网站内容" },
  { label: "文章管理", href: "/admin/news", icon: Newspaper, roles: ["super_admin", "content_manager"], group: "网站内容" },
  { label: "资讯发布", href: "/admin/news-automation", icon: ListChecks, roles: ["super_admin", "content_manager"], group: "网站内容" },
  { label: "素材库", href: "/admin/media", icon: ImageIcon, roles: ["super_admin", "content_manager", "product_manager"], group: "网站内容" },
  { label: "下载资料", href: "/admin/downloads", icon: Download, roles: ["super_admin", "content_manager", "product_manager"], group: "网站内容" },
  { label: "页面管理", href: "/admin/pages", icon: Home, roles: ["super_admin", "content_manager"], group: "网站内容" },
  { label: "访问数据", href: "/admin/analytics", icon: BarChart3, roles: ["super_admin", "analyst"], group: "数据概览" },
  { label: "WhatsApp 线索", href: "/admin/whatsapp", icon: MessageCircle, roles: ["super_admin", "sales", "analyst"], group: "数据概览" },
  { label: "搜索优化", href: "/admin/seo", icon: ScrollText, roles: ["super_admin"], group: "数据概览" },
  { label: "账号管理", href: "/admin/users", icon: Users, roles: ["super_admin"], group: "系统管理" },
  { label: "操作记录", href: "/admin/logs", icon: ScrollText, roles: ["super_admin"], group: "系统管理" },
  { label: "网站设置", href: "/admin/settings", icon: Settings, roles: ["super_admin"], group: "系统管理" },
];

function roleName(role?: string) {
  const names: Record<string, string> = {
    super_admin: "管理负责人",
    content_manager: "内容编辑",
    product_manager: "产品编辑",
    sales: "销售团队",
    analyst: "数据分析",
  };
  return names[role || ""] || "管理员";
}

export async function AdminShell({ children }: { children: ReactNode }) {
  const [admin, data] = await Promise.all([getCurrentAdmin(), getAdminData()]);
  const visibleNav = adminNav.filter((item) => admin && item.roles.includes(admin.role));
  const pendingLeads = data.inquiries.filter((item) => ["new", "pending"].includes(item.status || item.stage || "new")).length;
  const groups = [...new Set(visibleNav.map((item) => item.group))];

  return (
    <main className="min-h-screen bg-[#f4f7fb] text-slate-900">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-slate-800 bg-[#071426] p-4 text-white lg:block">
        <Link href="/admin/dashboard" className="flex items-center gap-3 text-xl font-black text-white">
          <span className="grid h-11 w-11 place-items-center rounded-md bg-white p-1.5">
            <Image src="/assets/images/logo.png" alt={`${company.shortName} logo`} width={34} height={25} className="h-auto w-full object-contain" priority />
          </span>
          <span>
            {company.shortName}
            <small className="block text-xs font-bold tracking-normal text-slate-400">运营后台</small>
          </span>
        </Link>
        <nav className="mt-7 max-h-[calc(100vh-142px)] space-y-5 overflow-y-auto pr-1" aria-label="后台功能菜单">
          {groups.map((group) => <div key={group}><p className="px-3 pb-1 text-[11px] font-black tracking-[0.12em] text-slate-300">{group}</p>{visibleNav.filter((item) => item.group === group).map((item) => (
            <Link key={item.href} href={item.href} className="flex min-h-10 items-center gap-3 rounded-md border border-transparent bg-transparent px-3 py-2 text-sm font-bold text-slate-100 opacity-100 transition-colors hover:border-white/10 hover:bg-white/10 hover:text-white">
              <item.icon size={17} />
              {item.label}
            </Link>
          ))}</div>)}
        </nav>
        <form action="/admin/logout" method="post" className="absolute bottom-4 left-4 right-4">
          <button className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm font-bold text-slate-200 hover:bg-white/10 hover:text-white" type="submit">
            <Lock size={17} />
            安全退出
          </button>
        </form>
      </aside>

      <section className="lg:pl-64">
        <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 px-5 py-4 backdrop-blur">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-black text-orange-600">GRIMM PUMP</p>
              <p className="mt-1 text-sm text-slate-500">{admin?.displayName || "管理账号"} · {roleName(admin?.role)}</p>
            </div>
            <div className="flex min-w-0 flex-1 items-center justify-end gap-3">
              {admin && ["super_admin", "sales"].includes(admin.role) ? <Link href="/admin/leads" className="rounded-md border border-orange-200 bg-orange-50 px-3 py-2 text-sm font-black text-orange-700">
                待跟进线索 {pendingLeads}
              </Link> : null}
              <Link href="/" className="rounded-md border border-slate-200 px-3 py-2 text-sm font-bold text-slate-600" target="_blank">
                查看网站
              </Link>
              <form action="/admin/logout" method="post" className="lg:hidden">
                <button className="rounded-md border border-slate-200 px-3 py-2 text-sm font-bold text-slate-600" type="submit">退出</button>
              </form>
            </div>
          </div>
          <details className="mx-auto mt-4 max-w-7xl lg:hidden"><summary className="cursor-pointer rounded-md bg-slate-100 px-3 py-2 text-sm font-bold text-slate-700">打开功能菜单</summary><nav className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">{visibleNav.map((item) => <Link key={item.href} href={item.href} className="rounded-md bg-slate-100 px-3 py-2 text-sm font-bold text-slate-700">{item.label}</Link>)}</nav></details>
        </header>
        <div className="mx-auto max-w-[1440px] px-5 py-7 lg:px-8 lg:py-8">
          {children}
        </div>
      </section>
    </main>
  );
}
