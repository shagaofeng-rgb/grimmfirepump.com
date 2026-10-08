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
    <main className="admin-login grid min-h-screen place-items-center bg-[#f5f7f8] px-5 py-12">
      <section className="w-full max-w-md">
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-md bg-white p-1.5 shadow-sm">
            <Image src="/assets/images/logo.png" alt="GRIMM PUMP logo" width={40} height={29} className="h-auto w-full object-contain" priority />
          </span>
          <p className="text-sm font-bold text-[#183543]">GRIMM PUMP</p>
        </div>
        <h1 className="mt-9 text-[28px] font-bold leading-tight text-[#183543]">运营后台登录</h1>
        <p className="mt-2 text-sm text-slate-600">GRIMM PUMP 网站运营后台</p>
        {!isAdminConfigured() ? (
          <div className="mt-8 rounded-md border border-orange-200 bg-orange-50 p-4 text-sm leading-6 text-orange-800">
            管理员登录尚未启用，请联系网站管理员完成账号配置。
          </div>
        ) : null}
        <LoginForm />
      </section>
    </main>
  );
}
