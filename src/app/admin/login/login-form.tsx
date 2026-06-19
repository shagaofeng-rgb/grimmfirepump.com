"use client";

import { useActionState } from "react";
import { loginAdmin } from "./actions";

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAdmin, undefined);

  return (
    <form action={action} className="mt-8 grid gap-4 rounded-lg bg-white p-6 text-slate-900 shadow-2xl">
      <label className="grid gap-2 text-sm font-black text-slate-700">
        Admin password
        <input
          name="password"
          type="password"
          required
          autoFocus
          className="min-h-12 rounded-md border border-slate-300 px-3"
          placeholder="Enter password"
        />
      </label>
      <button type="submit" className="button button-primary" disabled={pending}>
        {pending ? "Signing in..." : "Sign in"}
      </button>
      {state?.error ? <p className="text-sm font-bold text-red-600">{state.error}</p> : null}
    </form>
  );
}
