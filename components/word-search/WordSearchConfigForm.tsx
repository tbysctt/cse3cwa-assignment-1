"use client";

import {
  HCE_CORPUS,
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
  wordIds,
  words,
  onWordIdChange,
  difficulty,
  onDifficultyChange,
  canGenerate,
  generateHint,
  onGenerate,
}: {
  wordIds: string[];
  words: PhonemeWord[];
  onWordIdChange: (index: number, nextId: string) => void;
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
      description="Pick five different HCE corpus words and a difficulty. The live preview regenerates as you change the list."
    >
      <div className="flex flex-col gap-5">
        <fieldset>
          <legend className="text-sm font-semibold text-foreground">
            Corpus words
          </legend>
          <p className="mt-0.5 text-xs text-absent">
            Choose five words from the HCE list. Each word can only be used once.
          </p>
          <ol className="mt-3 space-y-3" aria-label="Word search corpus picks">
            {wordIds.map((wordId, index) => {
              const selected =
                words.find((word) => word.id === wordId) ??
                HCE_CORPUS.find((word) => word.id === wordId);
              const takenElsewhere = new Set(
                wordIds.filter((_, i) => i !== index),
              );
              return (
                <li key={`slot-${index}`} className="space-y-1.5">
                  <label
                    className="block text-xs font-medium uppercase tracking-wide text-absent"
                    htmlFor={`word-search-slot-${index}`}
                  >
                    Word {index + 1}
                  </label>
                  <select
                    id={`word-search-slot-${index}`}
                    className={inputClass}
                    value={wordId}
                    onChange={(event) =>
                      onWordIdChange(index, event.target.value)
                    }
                  >
                    {HCE_CORPUS.map((entry) => (
                      <option
                        key={entry.id}
                        value={entry.id}
                        disabled={
                          takenElsewhere.has(entry.id) && entry.id !== wordId
                        }
                      >
                        {entry.english} ({entry.phonemes.length} phonemes)
                      </option>
                    ))}
                  </select>
                  {selected ? (
                    <p className="font-mono text-sm text-foreground">
                      {phonemeWordDisplay(selected)}
                    </p>
                  ) : null}
                </li>
              );
            })}
          </ol>
        </fieldset>

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
