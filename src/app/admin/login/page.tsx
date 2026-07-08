import { redirect } from "next/navigation";
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
        <p className="text-sm font-black uppercase tracking-[0.16em] text-orange-300">GRIMM 管理后台</p>
        <h1 className="mt-4 text-4xl font-black leading-tight text-white">登录管理询盘、产品和内容。</h1>
        <p className="mt-4 leading-7 text-slate-400">
          默认后台语言为中文。账号、密码和第三方密钥均来自服务端环境变量，不会暴露在前端代码中。
        </p>
        {!isAdminConfigured() ? (
          <div className="mt-8 rounded-lg border border-orange-300/30 bg-orange-300/10 p-4 text-sm leading-6 text-orange-100">
            尚未配置 ADMIN_PASSWORD_HASH 或 ADMIN_PASSWORD。请先在 Vercel 环境变量中配置管理员密码。
          </div>
        ) : null}
        <LoginForm />
      </section>
    </main>
  );
}
