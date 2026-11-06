"use client";

import { useRef } from "react";

export function useSubmissionToken() {
  const current = useRef<{ payload: string; token?: string } | null>(null);
  return {
    tokenFor(data: Record<string, unknown>) {
      const payload = JSON.stringify(data);
      if (current.current?.payload !== payload) {
        current.current = { payload, token: globalThis.crypto?.randomUUID?.() };
      }
      return current.current.token;
    },
    clear() { current.current = null; },
  };
}
