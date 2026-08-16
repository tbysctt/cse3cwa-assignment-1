"use client";

import type { Phoneme } from "@/data/phonemes";
import { DIFFICULTY_OPTIONS, type Difficulty } from "@/lib/activity";
import { Field } from "@/components/shared/Field";
import { HintToggle } from "@/components/shared/HintToggle";
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

        <HintToggle
          value={showHints}
          onChange={onShowHintsChange}
          name="word-search-show-hints"
          description="When on, grid cells and word chips show tooltips such as /θ/ → TH (as in thin)."
        />

        <Field
          label="Difficulty"
          hint="Controls the grid size: easier activities use a smaller grid."
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
