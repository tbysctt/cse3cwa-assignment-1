"use client";

import { useTransition } from "react";
import { setLayoutDensity, setTheme } from "@/app/actions/theme";
import type { LayoutDensity, Theme } from "@/lib/theme";

type ThemeControlsProps = {
  theme: Theme;
  density: LayoutDensity;
};

export function ThemeControls({ theme, density }: ThemeControlsProps) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex flex-col gap-8">
      <fieldset disabled={pending} className="space-y-3">
        <legend className="text-base font-semibold text-foreground">
          Colour theme
        </legend>
        <p className="text-sm text-absent">
          Preference is stored in a cookie and applied across the site.
        </p>
        <div className="flex flex-wrap gap-3">
          {(["light", "dark"] as const).map((value) => {
            const selected = theme === value;
            return (
              <button
                key={value}
                type="button"
                className={[
                  "rounded-md border px-4 py-2 text-sm font-medium capitalize transition-colors",
                  selected
                    ? "border-accent bg-accent text-accent-contrast"
                    : "border-border bg-surface hover:bg-surface-muted",
                ].join(" ")}
                aria-pressed={selected}
                onClick={() => {
                  startTransition(() => {
                    void setTheme(value);
                  });
                }}
              >
                {value}
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset disabled={pending} className="space-y-3">
        <legend className="text-base font-semibold text-foreground">
          Layout density
        </legend>
        <p className="text-sm text-absent">
          Optional spacing preference for page padding and section gaps.
        </p>
        <div className="flex flex-wrap gap-3">
          {(["comfortable", "compact"] as const).map((value) => {
            const selected = density === value;
            return (
              <button
                key={value}
                type="button"
                className={[
                  "rounded-md border px-4 py-2 text-sm font-medium capitalize transition-colors",
                  selected
                    ? "border-accent bg-accent text-accent-contrast"
                    : "border-border bg-surface hover:bg-surface-muted",
                ].join(" ")}
                aria-pressed={selected}
                onClick={() => {
                  startTransition(() => {
                    void setLayoutDensity(value);
                  });
                }}
              >
                {value}
              </button>
            );
          })}
        </div>
      </fieldset>
    </div>
  );
}
