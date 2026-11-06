"use client";

import { useEffect, useRef, type ReactNode } from "react";

export function InteriorDisclosure({
  label,
  icon,
  children,
  className,
}: {
  label: string;
  icon: ReactNode;
  children: ReactNode;
  className: string;
}) {
  const details = useRef<HTMLDetailsElement>(null);
  const summary = useRef<HTMLElement>(null);

  useEffect(() => {
    const node = details.current;
    if (!node) return;
    function dismiss(event: PointerEvent) {
      if (node?.open && !node.contains(event.target as Node)) node.open = false;
    }
    document.addEventListener("pointerdown", dismiss);
    return () => document.removeEventListener("pointerdown", dismiss);
  }, []);

  return (
    <details
      ref={details}
      className={className}
      onKeyDown={(event) => {
        if (event.key !== "Escape" || !event.currentTarget.open) return;
        event.stopPropagation();
        event.currentTarget.open = false;
        summary.current?.focus();
      }}
      onClick={(event) => {
        if (event.target instanceof Element && event.target.closest("a[href]")) event.currentTarget.open = false;
      }}
    >
      <summary ref={summary} aria-label={label}>{icon}</summary>
      {children}
    </details>
  );
}
