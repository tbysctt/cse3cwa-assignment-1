"use client";

import { useId } from "react";
import type { Phoneme } from "@/data/phonemes";
import { formatIpa, hintLabel } from "@/data/phonemes";

/**
 * Picker for composing a phoneme sequence from the shared inventory. Used for
 * the Wordle target word and for each Word Search word row so teachers never
 * have to type IPA symbols manually.
 */
export function PhonemePicker({
  phonemes,
  inventory,
  onChange,
  max,
  showHint = true,
  label,
}: {
  phonemes: Phoneme[];
  inventory: Phoneme[];
  onChange: (next: Phoneme[]) => void;
  max?: number;
  showHint?: boolean;
  label: string;
}) {
  const groupId = useId();

  function removeAt(index: number) {
    onChange(phonemes.filter((_, i) => i !== index));
  }

  function add(phoneme: Phoneme) {
    if (max !== undefined && phonemes.length >= max) return;
    onChange([...phonemes, phoneme]);
  }

  const atLimit = max !== undefined && phonemes.length >= max;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-absent">
          {label}:
        </span>
        {phonemes.length === 0 ? (
          <span className="text-sm text-absent/80">
            No phonemes yet — tap a key below.
          </span>
        ) : (
          phonemes.map((phoneme, index) => (
            <button
              key={`${index}-${phoneme.ipa}`}
              type="button"
              className="ui-button ui-button-secondary min-h-10 min-w-10 px-2 font-mono text-base hover:border-danger"
              aria-label={`Remove ${formatIpa(phoneme.ipa)}${showHint ? ` (${hintLabel(phoneme)})` : ""}`}
              title={`Remove ${formatIpa(phoneme.ipa)}`}
              onClick={() => removeAt(index)}
            >
              <span aria-hidden="true">{formatIpa(phoneme.ipa)}</span>
            </button>
          ))
        )}
        {phonemes.length > 0 ? (
          <span className="flex gap-1">
            <button
              type="button"
              className="ui-button ui-button-secondary min-h-10 px-3"
              onClick={() => onChange(phonemes.slice(0, -1))}
            >
              Backspace
            </button>
            <button
              type="button"
              className="ui-button ui-button-secondary min-h-10 px-3"
              onClick={() => onChange([])}
            >
              Clear
            </button>
          </span>
        ) : null}
      </div>

      <div
        id={groupId}
        role="group"
        aria-label={`${label} — add phonemes`}
        className="flex flex-wrap gap-2"
      >
        {inventory.map((phoneme) => {
          const used = phonemes.some((p) => p.ipa === phoneme.ipa);
          return (
            <button
              key={phoneme.ipa}
              type="button"
              disabled={atLimit}
              className={[
                "inline-flex min-h-11 min-w-11 flex-col items-center justify-center rounded-[var(--control-radius)] border px-2 font-mono text-base transition-colors disabled:opacity-40",
                used
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-border bg-surface hover:bg-surface-muted",
              ].join(" ")}
              aria-label={showHint ? hintLabel(phoneme) : formatIpa(phoneme.ipa)}
              title={showHint ? hintLabel(phoneme) : formatIpa(phoneme.ipa)}
              onClick={() => add(phoneme)}
            >
              <span aria-hidden="true">{formatIpa(phoneme.ipa)}</span>
              <span className="text-[0.6rem] font-sans font-semibold uppercase tracking-wide text-absent">
                {phoneme.grapheme}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
