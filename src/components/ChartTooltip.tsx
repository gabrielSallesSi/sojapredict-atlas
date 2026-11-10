import type { ReactNode } from "react";

export function TipBox({ title, children }: { title?: ReactNode; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-white/10 bg-ink-950/95 px-3 py-2 text-xs shadow-2xl backdrop-blur">
      {title && <div className="mb-1 font-medium text-stone-100">{title}</div>}
      <div className="space-y-0.5 text-stone-400">{children}</div>
    </div>
  );
}
