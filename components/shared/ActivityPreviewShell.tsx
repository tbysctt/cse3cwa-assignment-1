import type { ReactNode } from "react";

export function ActivityPreviewShell({
  description,
  children,
}: {
  description: ReactNode;
  children: ReactNode;
}) {
  return (
    <section
      aria-label="Activity preview"
      className="ui-surface ui-surface-pad"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Activity Preview</h2>
        <span className="rounded-full border border-accent/40 bg-accent/10 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-accent">
          Student view
        </span>
      </div>
      <p className="mt-1 text-sm text-absent">{description}</p>
      <div className="mt-5">{children}</div>
    </section>
  );
}
