"use client";

import { useActionState, startTransition, type ReactNode } from "react";

export type EditorResult = { error: string } | undefined;

export function EditorForm({ action, className, children }: {
  action: (state: EditorResult, form: FormData) => Promise<EditorResult>;
  className: string;
  children: ReactNode;
}) {
  const [result, submit, pending] = useActionState(action, undefined);
  return <form className={className} action={submit} aria-busy={pending} onSubmit={(event) => {
    event.preventDefault();
    if (pending) return;
    const values = new FormData(event.currentTarget);
    startTransition(() => submit(values));
  }}>
    {result?.error && <p role="alert" className="col-span-full rounded-md bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">{result.error}</p>}
    {children}
  </form>;
}
