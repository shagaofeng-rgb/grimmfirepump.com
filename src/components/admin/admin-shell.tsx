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
  Newspaper,
  ScrollText,
  Search,
  Settings,
  Users,
} from "lucide-react";
import { company } from "@/data/site";
import { getCurrentAdmin, type AdminRole } from "@/lib/admin-auth";
import { getAdminData } from "@/lib/admin-data";

const allRoles: AdminRole[] = ["super_admin", "content_manager", "product_manager", "sales", "analyst"];
const adminNav: Array<{ label: string; href: string; icon: typeof LayoutDashboard; roles: AdminRole[] }> = [
  { label: "数据概览", href: "/admin/dashboard", icon: LayoutDashboard, roles: allRoles },
  { label: "产品管理", href: "/admin/products", icon: Boxes, roles: ["super_admin", "product_manager"] },
  { label: "产品分类", href: "/admin/product-categories", icon: FolderTree, roles: ["super_admin", "product_manager"] },
  { label: "产品知识库", href: "/admin/product-knowledge", icon: ScrollText, roles: ["super_admin", "product_manager"] },
  { label: "Blog 管理", href: "/admin/news", icon: Newspaper, roles: ["super_admin", "content_manager"] },
  { label: "News 自动化", href: "/admin/news-automation", icon: ListChecks, roles: ["super_admin", "content_manager"] },
  { label: "媒体资源", href: "/admin/media", icon: ImageIcon, roles: ["super_admin", "content_manager", "product_manager"] },
  { label: "客户询盘", href: "/admin/leads", icon: Inbox, roles: ["super_admin", "sales"] },
  { label: "表单管理", href: "/admin/forms", icon: FileText, roles: ["super_admin", "sales"] },
  { label: "访问分析", href: "/admin/analytics", icon: BarChart3, roles: ["super_admin", "analyst"] },
  { label: "SEO 管理", href: "/admin/seo", icon: Search, roles: ["super_admin"] },
  { label: "页面管理", href: "/admin/pages", icon: Home, roles: ["super_admin", "content_manager"] },
  { label: "下载资料", href: "/admin/downloads", icon: Download, roles: ["super_admin", "content_manager", "product_manager"] },
  { label: "账号与权限", href: "/admin/users", icon: Users, roles: ["super_admin"] },
  { label: "操作日志", href: "/admin/logs", icon: ScrollText, roles: ["super_admin"] },
  { label: "系统设置", href: "/admin/settings", icon: Settings, roles: ["super_admin"] },
];

function roleName(role?: string) {
  const names: Record<string, string> = {
    super_admin: "超级管理员",
    content_manager: "内容管理员",
    product_manager: "产品管理员",
    sales: "销售人员",
    analyst: "数据查看",
  };
  return names[role || ""] || "管理员";
}

export async function AdminShell({ children }: { children: ReactNode }) {
  const [admin, data] = await Promise.all([getCurrentAdmin(), getAdminData()]);
  const visibleNav = adminNav.filter((item) => admin && item.roles.includes(admin.role));
  const pendingLeads = data.inquiries.filter((item) => item.stage === "new" || item.stage === "qualified").length;

  return (
    <main className="min-h-screen bg-[#f4f7fb] text-slate-900">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-slate-800 bg-[#071426] p-4 text-white lg:block">
        <Link href="/admin/dashboard" className="flex items-center gap-3 text-xl font-black text-white">
          <span className="grid h-11 w-11 place-items-center rounded-md bg-white p-1.5">
            <Image src="/assets/images/logo.png" alt={`${company.shortName} logo`} width={34} height={25} className="h-auto w-full object-contain" priority />
          </span>
          <span>
            {company.shortName}
            <small className="block text-xs font-bold tracking-normal text-slate-400">网站运营后台</small>
          </span>
        </Link>
        <nav className="mt-7 grid max-h-[calc(100vh-142px)] gap-1 overflow-y-auto pr-1">
          {visibleNav.map((item) => (
            <Link key={item.href} href={item.href} className="flex min-h-10 items-center gap-3 rounded-md px-3 py-2 text-sm font-bold text-slate-300 hover:bg-white/10 hover:text-white">
              <item.icon size={17} />
              {item.label}
            </Link>
          ))}
        </nav>
        <form action="/admin/logout" method="post" className="absolute bottom-4 left-4 right-4">
          <button className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm font-bold text-slate-400 hover:bg-white/10 hover:text-white" type="submit">
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
              <p className="mt-1 text-sm text-slate-500">当前用户：{admin?.displayName || "Admin"} · {roleName(admin?.role)}</p>
            </div>
            <div className="flex min-w-0 flex-1 items-center justify-end gap-3">
              <label className="relative hidden w-full max-w-sm md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                <input className="min-h-10 w-full rounded-md border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm" placeholder="搜索产品、询盘、页面..." />
              </label>
              <Link href="/admin/leads" className="rounded-md border border-orange-200 bg-orange-50 px-3 py-2 text-sm font-black text-orange-700">
                待处理询盘 {pendingLeads}
              </Link>
              <Link href="/" className="rounded-md border border-slate-200 px-3 py-2 text-sm font-bold text-slate-600" target="_blank">
                查看网站
              </Link>
              <form action="/admin/logout" method="post" className="lg:hidden">
                <button className="rounded-md border border-slate-200 px-3 py-2 text-sm font-bold text-slate-600" type="submit">退出</button>
              </form>
            </div>
          </div>
          <nav className="mx-auto mt-4 flex max-w-7xl gap-2 overflow-x-auto pb-1 lg:hidden">
            {visibleNav.map((item) => (
              <Link key={item.href} href={item.href} className="shrink-0 rounded-md bg-slate-100 px-3 py-2 text-sm font-bold text-slate-700">
                {item.label}
              </Link>
            ))}
          </nav>
        </header>
        <div className="mx-auto max-w-[1440px] px-5 py-7 lg:px-8 lg:py-8">
          {children}
        </div>
      </section>
    </main>
  );
}
