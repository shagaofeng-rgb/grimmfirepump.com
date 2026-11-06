"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export function AdminNavLink({ href, label, icon: Icon, mobile = false }: {
  href: string;
  label: string;
  icon: ReactNode;
  mobile?: boolean;
}) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(`${href}/`);

  return <Link href={href} prefetch={false} aria-current={active ? "page" : undefined} className={mobile ? "admin-mobile-link" : "admin-nav-link"}
    onClick={mobile ? (event) => { event.currentTarget.closest("details")?.removeAttribute("open"); } : undefined}>
    {Icon}
    <span>{label}</span>
  </Link>;
}
