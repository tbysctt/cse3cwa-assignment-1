"use client";

import { useTransition } from "react";
import { setTheme } from "@/app/actions/theme";
import type { Theme } from "@/lib/theme";

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
        "ui-button capitalize",
        selected
          ? "ui-button-primary"
          : "ui-button-secondary",
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
}: {
  theme: Theme;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex flex-col gap-6">
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
    </div>
  );
}
