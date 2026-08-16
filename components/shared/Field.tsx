import { useId, type ReactNode } from "react";

/**
 * Wraps a form control in a labelled field with a supporting description.
 * Associates the label with the control via a generated id.
 */
export function Field({
  label,
  hint,
  children,
  htmlFor,
}: {
  label: string;
  hint?: string;
  children: (id: string) => ReactNode;
  htmlFor?: string;
}) {
  const generatedId = useId();
  const id = htmlFor ?? generatedId;

  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={id}
        className="text-sm font-semibold text-foreground"
      >
        {label}
      </label>
      {hint ? <p className="text-xs text-absent">{hint}</p> : null}
      {children(id)}
    </div>
  );
}
