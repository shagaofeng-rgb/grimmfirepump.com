"use client";

import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";
import { useActionState } from "react";
import { loginAdmin } from "./actions";

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAdmin, undefined);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={action} className="mt-8 grid gap-4 rounded-lg bg-white p-6 text-slate-900 shadow-2xl">
      <label className="grid gap-2 text-sm font-black text-slate-700">
        后台账号
        <input
          name="username"
          type="text"
          required
          autoFocus
          autoComplete="username"
          className="min-h-12 rounded-md border border-slate-300 px-3"
          placeholder="admin"
        />
      </label>
      <label className="grid gap-2 text-sm font-black text-slate-700">
        登录密码
        <span className="relative">
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            required
            autoComplete="current-password"
            className="min-h-12 w-full rounded-md border border-slate-300 px-3 pr-12"
            placeholder="Enter password"
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-md text-slate-500 hover:bg-slate-100"
            onClick={() => setShowPassword((value) => !value)}
            aria-label={showPassword ? "隐藏密码" : "显示密码"}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </span>
      </label>
      <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
        <input name="remember" type="checkbox" className="h-4 w-4 rounded border-slate-300" />
        记住登录状态 14 天
      </label>
      <button type="submit" className="button button-primary gap-2" disabled={pending}>
        {pending ? <Loader2 className="animate-spin" size={18} /> : null}
        {pending ? "登录中..." : "登录后台"}
      </button>
      {state?.error ? <p className="text-sm font-bold text-red-600">{state.error}</p> : null}
    </form>
  );
}
