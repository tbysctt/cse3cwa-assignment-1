"use client";

import { Field } from "@/components/shared/Field";
import { SectionCard } from "@/components/shared/SectionCard";
import {
  phonemeWordDisplay,
  type PhonemeLength,
  type PhonemeWord,
} from "@/data/phonemes";
import { PHONEME_LENGTHS } from "@/data/hce-corpus";
import {
  DIFFICULTY_OPTIONS,
  type Difficulty,
} from "@/lib/activity";
import { DIFFICULTY_PRESETS } from "@/lib/wordle";

const inputClass =
  "ui-control w-full px-3 py-2 text-sm focus:border-accent focus:outline-none";

export function WordleConfigForm({
  length,
  onLengthChange,
  wordId,
  onWordIdChange,
  lengthWords,
  difficulty,
  onDifficultyChange,
  canGenerate,
  onGenerate,
}: {
  length: PhonemeLength;
  onLengthChange: (next: PhonemeLength) => void;
  wordId: string;
  onWordIdChange: (next: string) => void;
  lengthWords: PhonemeWord[];
  difficulty: Difficulty;
  onDifficultyChange: (next: Difficulty) => void;
  canGenerate: boolean;
  onGenerate: () => void;
}) {
  const selected = lengthWords.find((entry) => entry.id === wordId) ?? lengthWords[0];
  const preset = DIFFICULTY_PRESETS[difficulty];

  return (
    <SectionCard
      title="Configure activity"
      description="Choose a phoneme length, an HCE corpus word, and a difficulty. The live preview updates as you go."
    >
      <div className="flex flex-col gap-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            label="Phoneme length"
            hint="Each corpus word has 3, 4, or 5 phonemes. Students guess that many cells."
          >
            {(id) => (
              <select
                id={id}
                className={inputClass}
                value={length}
                onChange={(event) =>
                  onLengthChange(Number(event.target.value) as PhonemeLength)
                }
              >
                {PHONEME_LENGTHS.map((value) => (
                  <option key={value} value={value}>
                    {value} phonemes
                  </option>
                ))}
              </select>
            )}
          </Field>

          <Field
            label="Corpus word"
            hint="Select one of the 30 approved HCE words for this length."
          >
            {(id) => (
              <select
                id={id}
                className={inputClass}
                value={selected?.id ?? ""}
                onChange={(event) => onWordIdChange(event.target.value)}
              >
                {lengthWords.map((entry) => (
                  <option key={entry.id} value={entry.id}>
                    {entry.english}
                  </option>
                ))}
              </select>
            )}
          </Field>
        </div>

        {selected ? (
          <div className="rounded-[var(--control-radius)] border border-border bg-surface-muted px-3 py-2 text-sm">
            <p className="font-semibold text-foreground">
              Target: {phonemeWordDisplay(selected)}
            </p>
            <p className="mt-1 text-xs text-absent">
              English answer (revealed on win/loss): {selected.english}
            </p>
          </div>
        ) : null}

        <Field
          label="Difficulty"
          hint={`Sets guess count and hints. Current: ${preset.maxAttempts} guesses, hints ${preset.showHints ? "on" : "off"}.`}
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
            title={
              canGenerate
                ? "Download the activity as a standalone HTML file"
                : "Select a corpus word first"
            }
          >
            Generate HTML
          </button>
          <p className="mt-2 text-xs text-absent">
            Downloads a self-contained, playable{" "}
            <code className="rounded bg-surface-muted px-1">phoneme-wordle.html</code>{" "}
            file that runs in any browser.
          </p>
        </div>
      </div>
    </SectionCard>
  );
}
