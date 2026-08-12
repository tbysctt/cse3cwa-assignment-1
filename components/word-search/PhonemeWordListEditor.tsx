"use client";

import { useState } from "react";
import { PhonemePicker } from "@/components/phoneme/PhonemePicker";
import type { Phoneme } from "@/data/phonemes";
import { formatIpa } from "@/data/phonemes";

export type WordSearchRow = {
  id: string;
  english: string;
  phonemes: Phoneme[];
};

/**
 * Editable five-word list. Each row pairs an English word with a phoneme
 * sequence; a shared picker edits the active row. Kept as plain data so a
 * database-provided list can replace it in later assessments.
 */
export function PhonemeWordListEditor({
  rows,
  inventory,
  showHint,
  onChange,
}: {
  rows: WordSearchRow[];
  inventory: Phoneme[];
  showHint: boolean;
  onChange: (rows: WordSearchRow[]) => void;
}) {
  const [activeRowId, setActiveRowId] = useState<string | null>(rows[0]?.id ?? null);
  const activeRow = rows.find((row) => row.id === activeRowId);

  function updateRow(id: string, patch: Partial<WordSearchRow>) {
    onChange(
      rows.map((row) => (row.id === id ? { ...row, ...patch } : row)),
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <ul className="flex flex-col gap-3">
        {rows.map((row, index) => {
          const active = row.id === activeRowId;
          return (
            <li
              key={row.id}
              className={[
                "rounded-lg border border-border p-3",
                active ? "bg-accent/5" : "bg-background",
              ].join(" ")}
            >
              <div className="grid gap-3 sm:grid-cols-[minmax(0,9rem)_1fr_auto] sm:items-center">
                <label className="flex flex-col gap-1 text-xs font-medium text-absent">
                  Word {index + 1} (English)
                  <input
                    type="text"
                    value={row.english}
                    onChange={(event) =>
                      updateRow(row.id, { english: event.target.value })
                    }
                    placeholder="e.g. thin"
                    autoComplete="off"
                    className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-absent/70"
                  />
                </label>

                <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                  {row.phonemes.length === 0 ? (
                    <span className="text-sm text-absent/80">
                      No phonemes
                    </span>
                  ) : (
                    row.phonemes.map((phoneme, phonemeIndex) => (
                      <span
                        key={`${phonemeIndex}-${phoneme.ipa}`}
                        className="inline-flex min-h-9 min-w-9 items-center justify-center rounded-md border border-border bg-surface px-1.5 font-mono text-sm"
                      >
                        {formatIpa(phoneme.ipa)}
                      </span>
                    ))
                  )}
                </div>

                <button
                  type="button"
                  className={[
                    "rounded-md border px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "border-accent bg-accent text-accent-contrast"
                      : "border-border bg-surface hover:bg-surface-muted",
                  ].join(" ")}
                  aria-expanded={active}
                  onClick={() =>
                    setActiveRowId(active ? null : row.id)
                  }
                >
                  {active ? "Close editor" : "Edit phonemes"}
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      {activeRow ? (
        <div className="rounded-lg border border-border bg-background p-3">
          <p className="mb-2 text-sm font-semibold text-foreground">
            Edit phonemes for{" "}
            <span className="font-mono text-accent">
              {activeRow.english.trim() || "this word"}
            </span>
          </p>
          <PhonemePicker
            label="Phonemes"
            phonemes={activeRow.phonemes}
            inventory={inventory}
            showHint={showHint}
            onChange={(next) => updateRow(activeRow.id, { phonemes: next })}
          />
        </div>
      ) : null}
    </div>
  );
}
