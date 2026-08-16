"use client";

import {
  phonemeWordDisplay,
  type PhonemeWord,
} from "@/data/phonemes";
import { DIFFICULTY_OPTIONS, type Difficulty } from "@/lib/activity";
import { DIFFICULTY_PRESETS } from "@/lib/wordle";
import { GRID_SIZE_BY_DIFFICULTY } from "@/lib/word-search";
import { Field } from "@/components/shared/Field";
import { SectionCard } from "@/components/shared/SectionCard";

const inputClass =
  "ui-control w-full px-3 py-2 text-sm focus:border-accent focus:outline-none";

export function WordSearchConfigForm({
  words,
  difficulty,
  onDifficultyChange,
  canGenerate,
  generateHint,
  onGenerate,
}: {
  words: PhonemeWord[];
  difficulty: Difficulty;
  onDifficultyChange: (next: Difficulty) => void;
  canGenerate: boolean;
  generateHint?: string;
  onGenerate: () => void;
}) {
  const preset = DIFFICULTY_PRESETS[difficulty];
  const gridSize = GRID_SIZE_BY_DIFFICULTY[difficulty];

  return (
    <SectionCard
      title="Configure activity"
      description="The activity uses a fixed five-word phoneme list. Choose a difficulty to set the grid size and hints."
    >
      <div className="flex flex-col gap-5">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Word list</h3>
          <p className="mt-0.5 text-xs text-absent">
            Fixed Assessment 1 list of five phoneme words.
          </p>
          <ul className="mt-3 space-y-2" aria-label="Fixed word search list">
            {words.map((word) => (
              <li
                key={word.id}
                className="rounded-[var(--control-radius)] border border-border bg-surface-muted px-3 py-2 text-sm"
              >
                <p className="font-mono text-foreground">
                  {phonemeWordDisplay(word)}
                </p>
                <p className="mt-0.5 text-xs text-absent">{word.english}</p>
              </li>
            ))}
          </ul>
        </div>

        <Field
          label="Difficulty"
          hint={`Sets grid size and hints. Current: ${gridSize}×${gridSize} grid, hints ${preset.showHints ? "on" : "off"}.`}
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
