import { redirect } from "next/navigation";
import Image from "next/image";
import { isAdminAuthenticated, isAdminConfigured } from "@/lib/admin-auth";
import { LoginForm } from "./login-form";

export const metadata = {
  title: "Admin Login",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  if (await isAdminAuthenticated()) {
    redirect("/admin/dashboard");
  }

  return (
    <main className="grid min-h-screen place-items-center bg-slate-950 px-6 py-16">
      <section className="w-full max-w-md">
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-md bg-white p-1.5">
            <Image src="/assets/images/logo.png" alt="GRIMM PUMP logo" width={40} height={29} className="h-auto w-full object-contain" priority />
          </span>
          <p className="text-sm font-black uppercase tracking-[0.16em] text-orange-300">GRIMM 管理后台</p>
        </div>
        <h1 className="mt-5 text-4xl font-black leading-tight text-white">登录网站运营后台</h1>
        <p className="mt-4 leading-7 text-slate-400">管理产品、新闻、询盘、下载资料和网站运营数据。</p>
        {!isAdminConfigured() ? (
          <div className="mt-8 rounded-lg border border-orange-300/30 bg-orange-300/10 p-4 text-sm leading-6 text-orange-100">
            管理员登录尚未启用，请联系网站管理员完成账号配置。
          </div>
        ) : null}
        <LoginForm />
      </section>
    </main>
  );
}
