import { AdminShell } from "@/components/admin/admin-shell";
import { AdminPageHeader, StatusPill } from "@/components/admin/admin-widgets";
import { PasswordForm } from "@/components/admin/password-form";
import { listAdminUsers } from "@/lib/admin-cms";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const users = await listAdminUsers();
  const permissions = ["查看", "新增", "编辑", "删除", "发布", "导出", "账号管理", "系统设置"];
  return (
    <AdminShell>
      <AdminPageHeader eyebrow="账号与权限" title="管理员账号、角色和权限" description="查看后台账号、角色、状态和权限范围。" />
      <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_420px]">
        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-slate-50 text-slate-600"><tr>{["账号", "显示名", "角色", "状态", "权限"].map((head) => <th key={head} className="px-4 py-3 font-black">{head}</th>)}</tr></thead>
            <tbody>
              {users.map((user) => <tr key={user.id} className="border-t border-slate-100"><td className="px-4 py-4">{user.username}</td><td className="px-4 py-4">{user.displayName}</td><td className="px-4 py-4">{user.role}</td><td className="px-4 py-4"><StatusPill value={user.status} /></td><td className="px-4 py-4">{user.role === "super_admin" ? permissions.join(" / ") : "按角色限制"}</td></tr>)}
            </tbody>
          </table>
        </section>
        <PasswordForm />
      </div>
    </AdminShell>
  );
}
