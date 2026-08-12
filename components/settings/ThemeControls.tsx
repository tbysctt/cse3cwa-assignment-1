"use client";

import { useTransition } from "react";
import { setLayoutDensity, setTheme } from "@/app/actions/theme";
import type { LayoutDensity, Theme } from "@/lib/theme";

function OptionButton({
  label,
  selected,
  onSelect,
  disabled,
}: {
  label: string;
  selected: boolean;
  onSelect: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      className={[
        "rounded-md border px-4 py-2 text-sm font-medium capitalize transition-colors",
        selected
          ? "border-accent bg-accent text-accent-contrast"
          : "border-border bg-background hover:bg-surface-muted",
      ].join(" ")}
      aria-pressed={selected}
      disabled={disabled}
      onClick={onSelect}
    >
      {label}
    </button>
  );
}

export function ThemeControls({
  theme,
  density,
}: {
  theme: Theme;
  density: LayoutDensity;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex flex-col gap-8">
      <fieldset disabled={pending} className="space-y-3">
        <legend className="text-base font-semibold text-foreground">
          Colour theme
        </legend>
        <p className="text-sm text-absent">
          Stored in a cookie and applied across the whole site. &ldquo;System&rdquo;
          follows your operating system preference.
        </p>
        <div className="flex flex-wrap gap-3">
          {(["light", "dark", "system"] as const).map((value) => (
            <OptionButton
              key={value}
              label={value}
              selected={theme === value}
              onSelect={() => {
                startTransition(() => {
                  void setTheme(value);
                });
              }}
            />
          ))}
        </div>
      </fieldset>

      <fieldset disabled={pending} className="space-y-3">
        <legend className="text-base font-semibold text-foreground">
          Layout density
        </legend>
        <p className="text-sm text-absent">
          Controls page padding and spacing between sections.
        </p>
        <div className="flex flex-wrap gap-3">
          {(["comfortable", "compact"] as const).map((value) => (
            <OptionButton
              key={value}
              label={value}
              selected={density === value}
              onSelect={() => {
                startTransition(() => {
                  void setLayoutDensity(value);
                });
              }}
            />
          ))}
        </div>
      </fieldset>
    </div>
  );
}
