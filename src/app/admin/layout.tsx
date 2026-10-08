import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./admin-theme.css";

export const metadata: Metadata = {
  title: "Admin | GRIMM PUMP",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return children;
}
