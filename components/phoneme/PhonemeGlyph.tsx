"use client";

import { useId, useState } from "react";
import type { Phoneme } from "@/lib/phonemes";
import { formatIpa, hintLabel } from "@/lib/phonemes";

type PhonemeGlyphProps = {
  phoneme: Phoneme;
  as?: "span" | "button";
  className?: string;
  showGrapheme?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  "aria-label"?: string;
};

export function PhonemeGlyph({
  phoneme,
  as = "span",
  className = "",
  showGrapheme = false,
  disabled,
  onClick,
  "aria-label": ariaLabel,
}: PhonemeGlyphProps) {
  const tipId = useId();
  const [open, setOpen] = useState(false);
  const label = hintLabel(phoneme);
  const sharedClass = [
    "relative inline-flex min-h-10 min-w-10 flex-col items-center justify-center rounded-md border border-border bg-surface px-2 py-1 font-mono text-base leading-none",
    className,
  ].join(" ");

  const content = (
    <>
      <span aria-hidden="true">{formatIpa(phoneme.ipa)}</span>
      {showGrapheme ? (
        <span className="mt-1 text-[0.65rem] font-sans font-semibold uppercase tracking-wide text-absent">
          {phoneme.grapheme}
        </span>
      ) : null}
      <span id={tipId} className="sr-only">
        {label}
      </span>
      {open ? (
        <span
          role="tooltip"
          className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 w-max max-w-48 -translate-x-1/2 rounded-md bg-foreground px-2 py-1 text-center font-sans text-xs font-medium text-background shadow-md"
        >
          {phoneme.grapheme} ({phoneme.example})
        </span>
      ) : null}
    </>
  );

  if (as === "button") {
    return (
      <button
        type="button"
        className={sharedClass}
        title={label}
        aria-describedby={tipId}
        aria-label={ariaLabel ?? label}
        disabled={disabled}
        onClick={onClick}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
      >
        {content}
      </button>
    );
  }

  return (
    <span
      className={sharedClass}
      title={label}
      aria-describedby={tipId}
      tabIndex={0}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      {content}
    </span>
  );
}
