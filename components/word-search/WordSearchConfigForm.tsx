"use client";

import type { Phoneme } from "@/data/phonemes";
import { DIFFICULTY_OPTIONS, type Difficulty } from "@/lib/wordle";
import { Field } from "@/components/shared/Field";
import { SectionCard } from "@/components/shared/SectionCard";
import {
  PhonemeWordListEditor,
  type WordSearchRow,
} from "./PhonemeWordListEditor";

const inputClass =
  "ui-control w-full px-3 py-2 text-sm focus:border-accent focus:outline-none";

export function WordSearchConfigForm({
  rows,
  inventory,
  showHints,
  onShowHintsChange,
  difficulty,
  onDifficultyChange,
  onRowsChange,
  configuredCount,
  canGenerate,
  generateHint,
  onGenerate,
}: {
  rows: WordSearchRow[];
  inventory: Phoneme[];
  showHints: boolean;
  onShowHintsChange: (next: boolean) => void;
  difficulty: Difficulty;
  onDifficultyChange: (next: Difficulty) => void;
  onRowsChange: (next: WordSearchRow[]) => void;
  configuredCount: number;
  canGenerate: boolean;
  generateHint?: string;
  onGenerate: () => void;
}) {
  return (
    <SectionCard
      title="Configure activity"
      description="Edit the fixed five-word phoneme list, hints and difficulty. The grid preview regenerates as you edit."
    >
      <div className="flex flex-col gap-5">
        <PhonemeWordListEditor
          rows={rows}
          inventory={inventory}
          showHint={showHints}
          onChange={onRowsChange}
        />
        <p className="text-xs text-absent">
          Configured words: {configuredCount}/5
        </p>

        <fieldset>
          <legend className="text-sm font-semibold text-foreground">
            Show phoneme hints
          </legend>
          <p className="mt-0.5 text-xs text-absent">
            When on, grid cells and word chips show tooltips such as /θ/ → TH
            (as in thin).
          </p>
          <div className="mt-2 flex gap-4" role="radiogroup" aria-label="Show phoneme hints">
            {[
              { value: true, label: "Yes" },
              { value: false, label: "No" },
            ].map((option) => (
              <label
                key={option.label}
                className="flex cursor-pointer items-center gap-2 text-sm font-medium"
              >
                <input
                  type="radio"
                  name="word-search-show-hints"
                  className="size-4 accent-[var(--accent)]"
                  checked={showHints === option.value}
                  onChange={() => onShowHintsChange(option.value)}
                />
                {option.label}
              </label>
            ))}
          </div>
        </fieldset>

        <Field
          label="Difficulty"
          hint="Recorded in the downloaded activity settings."
        >
          {(id) => (
            <select
              id={id}
              className={inputClass}
              value={difficulty}
              onChange={(event) =>
                onDifficultyChange(event.target.value as Difficulty)
              }
            >
              {DIFFICULTY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          )}
        </Field>

        <div className="border-t border-border pt-4">
          <button
            type="button"
            className="ui-button ui-button-primary w-full disabled:cursor-not-allowed disabled:opacity-50"
            onClick={onGenerate}
            disabled={!canGenerate}
            title={generateHint}
          >
            Generate HTML
          </button>
          <p className="mt-2 text-xs text-absent">
            Downloads a self-contained, playable{" "}
            <code className="rounded bg-surface-muted px-1">
              phoneme-word-search.html
            </code>{" "}
            file that runs in any browser.
          </p>
        </div>
      </div>
    </SectionCard>
  );
}
