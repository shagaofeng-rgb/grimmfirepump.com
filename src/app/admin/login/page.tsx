import { redirect } from "next/navigation";
import { isAdminAuthenticated, isAdminConfigured } from "@/lib/admin-auth";
import { LoginForm } from "./login-form";

export const metadata = {
  title: "Admin Login",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  if (await isAdminAuthenticated()) {
    redirect("/admin");
  }

  return (
    <main className="grid min-h-screen place-items-center bg-slate-950 px-6 py-16">
      <section className="w-full max-w-md">
        <p className="text-sm font-black uppercase tracking-[0.16em] text-orange-300">Secure Admin</p>
        <h1 className="mt-4 text-4xl font-black leading-tight text-white">Sign in to manage leads.</h1>
        <p className="mt-4 leading-7 text-slate-400">
          Protected area for inquiries, download leads and marketing analytics.
        </p>
        {!isAdminConfigured() ? (
          <div className="mt-8 rounded-lg border border-orange-300/30 bg-orange-300/10 p-4 text-sm leading-6 text-orange-100">
            ADMIN_PASSWORD is not configured. Set it in Vercel environment variables before using the dashboard.
          </div>
        ) : null}
        <LoginForm />
      </section>
    </main>
  );
}
