import Link from "next/link";
import type { ReactNode } from "react";
import { company } from "@/data/site";

const adminNav = [
  { label: "Dashboard", href: "/admin" },
  { label: "Inquiries", href: "/admin/inquiries" },
  { label: "Products", href: "/admin/products" },
  { label: "Downloads", href: "/admin/downloads" },
  { label: "Analytics", href: "/admin/analytics" },
  { label: "Website", href: "/" },
];

export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-white/10 bg-slate-950 p-6 lg:block">
        <Link href="/admin" className="text-xl font-black tracking-[0.04em] text-white">{company.shortName}</Link>
        <p className="mt-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Production Admin</p>
        <nav className="mt-8 grid gap-2">
          {adminNav.map((item) => (
            <Link key={item.href} href={item.href} className="rounded-md px-3 py-2 text-sm font-bold text-slate-300 hover:bg-white/10 hover:text-white">
              {item.label}
            </Link>
          ))}
          <form action="/admin/logout" method="post">
            <button className="w-full rounded-md px-3 py-2 text-left text-sm font-bold text-slate-500 hover:bg-white/10 hover:text-white" type="submit">
              Sign out
            </button>
          </form>
        </nav>
      </aside>
      <section className="lg:pl-64">
        <div className="border-b border-white/10 bg-slate-900/60 px-5 py-4 lg:hidden">
          <div className="flex flex-wrap gap-3">
            {adminNav.map((item) => (
              <Link key={item.href} href={item.href} className="text-sm font-bold text-slate-300">{item.label}</Link>
            ))}
            <form action="/admin/logout" method="post">
              <button className="text-sm font-bold text-slate-500" type="submit">Sign out</button>
            </form>
          </div>
        </div>
        <div className="mx-auto max-w-7xl px-5 py-8 lg:px-8">{children}</div>
      </section>
    </main>
  );
}
