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
  MessageCircle,
  Newspaper,
  ScrollText,
  Settings,
  Users,
  ExternalLink,
  Menu,
  LogOut,
} from "lucide-react";
import { AdminNavLink } from "@/components/admin/admin-nav-link";
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
    <main className="admin-workspace min-h-screen text-slate-900">
      <aside className="admin-sidebar fixed inset-y-0 left-0 hidden w-[226px] text-white lg:flex lg:flex-col">
        <Link href="/admin/dashboard" className="admin-brand flex items-center gap-3 text-lg font-bold text-white">
          <span className="grid h-10 w-10 place-items-center rounded-md bg-white p-1.5">
            <Image src="/assets/images/logo.png" alt={`${company.shortName} logo`} width={34} height={25} className="h-auto w-full object-contain" priority />
          </span>
          <span>
            {company.shortName}
            <small className="block text-[11px] font-medium text-slate-400">运营管理</small>
          </span>
        </Link>
        <nav className="admin-sidebar-nav flex-1 space-y-5 overflow-y-auto" aria-label="后台功能菜单">
          {groups.map((group) => <div key={group}><p className="admin-nav-group">{group}</p>{visibleNav.filter((item) => item.group === group).map((item) => (
            <AdminNavLink key={item.href} href={item.href} label={item.label} icon={<item.icon size={18} strokeWidth={1.9} />} />
          ))}</div>)}
        </nav>
        <form action="/admin/logout" method="post" className="admin-sidebar-footer">
          <button className="admin-nav-link w-full" type="submit">
            <LogOut size={17} />
            安全退出
          </button>
        </form>
      </aside>

      <section className="min-w-0 lg:pl-[226px]">
        <header className="admin-topbar sticky top-0 z-40 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <span className="admin-topbar-mark"><Image src="/assets/images/logo.png" alt="" width={26} height={26} className="h-6 w-6 object-contain" /></span>
              <div className="min-w-0"><p className="text-sm font-bold text-slate-900">GRIMM PUMP</p><p className="text-xs text-slate-500">{admin?.displayName || "管理账号"} · {roleName(admin?.role)}</p></div>
            </div>
            <div className="flex min-w-0 items-center justify-end gap-2 sm:gap-3">
              {admin && ["super_admin", "sales"].includes(admin.role) ? <Link href="/admin/leads" className="admin-pending-link">
                <Inbox size={15} strokeWidth={1.8} />待跟进 <strong>{pendingLeads}</strong>
              </Link> : null}
              <Link href="/" className="admin-site-link" target="_blank" rel="noopener noreferrer" aria-label="查看网站" title="查看网站">
                <span>查看网站</span><ExternalLink size={15} />
              </Link>
              <form action="/admin/logout" method="post" className="lg:hidden">
                <button className="admin-mobile-logout" type="submit" aria-label="退出登录" title="退出登录"><LogOut size={17} /></button>
              </form>
            </div>
          </div>
          <details className="admin-mobile-menu mx-auto max-w-[1440px] lg:hidden"><summary><Menu size={18} /> 功能菜单</summary><nav className="mt-2 grid grid-cols-2 gap-1 sm:grid-cols-3">{visibleNav.map((item) => <AdminNavLink key={item.href} href={item.href} label={item.label} icon={<item.icon size={18} strokeWidth={1.9} />} mobile />)}</nav></details>
        </header>
        <div className="admin-content mx-auto max-w-[1440px] px-4 py-7 sm:px-6 lg:px-8 lg:py-9">
          {children}
        </div>
      </section>
    </main>
  );
}
