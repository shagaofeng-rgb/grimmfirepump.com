"use client";

import { useActionState, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { changeAdminPassword } from "@/app/admin/actions";
import { inputClass } from "@/components/admin/admin-widgets";

export function PasswordForm() {
  const [state, action, pending] = useActionState(changeAdminPassword, undefined);
  const [show, setShow] = useState(false);
  return (
    <form action={action} className="grid gap-3 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-black text-slate-950">修改管理员密码</h2>
      <input name="oldPassword" type={show ? "text" : "password"} required className={inputClass} placeholder="旧密码" />
      <input name="newPassword" type={show ? "text" : "password"} required className={inputClass} placeholder="新密码，至少 10 位" />
      <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
        <button type="button" className="grid h-8 w-8 place-items-center rounded-md border border-slate-200" onClick={() => setShow((value) => !value)}>
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
        显示 / 隐藏密码
      </label>
      <button className="button button-primary" disabled={pending} type="submit">{pending ? "保存中..." : "更新密码"}</button>
      {state?.error ? <p className="text-sm font-bold text-red-600">{state.error}</p> : null}
      {state?.success ? <p className="text-sm font-bold text-emerald-700">{state.success}</p> : null}
    </form>
  );
}
