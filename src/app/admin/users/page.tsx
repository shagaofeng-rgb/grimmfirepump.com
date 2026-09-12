import { AdminShell } from "@/components/admin/admin-shell";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { AdminPageHeader, StatusPill } from "@/components/admin/admin-widgets";
import { PasswordForm } from "@/components/admin/password-form";
import { listAdminUsers } from "@/lib/admin-cms";
import { paginationPageSize, parsePositiveInt } from "@/lib/admin-listing";
import { paginate } from "@/lib/visitor-analytics";

export const dynamic = "force-dynamic";

type PageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> };

function param(params: Record<string, string | string[] | undefined>, name: string) {
  const value = params[name];
  return Array.isArray(value) ? value[0] || "" : value || "";
}

export default async function UsersPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const users = await listAdminUsers();
  const page = parsePositiveInt(param(params, "page"));
  const pageSize = paginationPageSize(param(params, "pageSize"));
  const pagedUsers = paginate(users, page, pageSize);
  const permissions = ["查看", "新增", "编辑", "删除", "发布", "导出", "账号管理", "系统设置"];
  return (
    <AdminShell>
      <AdminPageHeader eyebrow="账号与权限" title="管理员账号、角色和权限" description="查看后台账号、角色、状态和权限范围。" />
      <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_420px]">
        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-slate-50 text-slate-600"><tr>{["账号", "显示名", "角色", "状态", "权限"].map((head) => <th key={head} className="px-4 py-3 font-black">{head}</th>)}</tr></thead>
            <tbody>
              {pagedUsers.items.map((user) => <tr key={user.id} className="border-t border-slate-100"><td className="px-4 py-4">{user.username}</td><td className="px-4 py-4">{user.displayName}</td><td className="px-4 py-4">{user.role}</td><td className="px-4 py-4"><StatusPill value={user.status} /></td><td className="px-4 py-4">{user.role === "super_admin" ? permissions.join(" / ") : "按角色限制"}</td></tr>)}
            </tbody>
          </table>
          <AdminPagination pathname="/admin/users" query={{ pageSize: String(pageSize) }} page={pagedUsers.page} totalPages={pagedUsers.totalPages} total={pagedUsers.total} pageSize={pagedUsers.pageSize} label="账号" />
        </section>
        <PasswordForm />
      </div>
    </AdminShell>
  );
}
