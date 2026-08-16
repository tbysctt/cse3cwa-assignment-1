import type { ReactNode } from "react";

export function SectionCard({
  title,
  description,
  children,
  className = "",
}: {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`ui-surface ui-surface-pad ${className}`}
    >
      <h2 className="text-lg font-semibold">{title}</h2>
      {description ? (
        <p className="mt-1 text-sm text-absent">{description}</p>
      ) : null}
      <div className="mt-4">{children}</div>
    </section>
  );
}
