"use client";

import { useState } from "react";
import { Field } from "@/components/shared/Field";
import { HintToggle } from "@/components/shared/HintToggle";
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
import {
  clampMaxAttempts,
  DIFFICULTY_PRESETS,
} from "@/lib/wordle";

const inputClass =
  "ui-control w-full px-3 py-2 text-sm focus:border-accent focus:outline-none";

export function WordleConfigForm({
  length,
  onLengthChange,
  wordId,
  onWordIdChange,
  lengthWords,
  showHints,
  onShowHintsChange,
  maxAttempts,
  onMaxAttemptsChange,
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
  showHints: boolean;
  onShowHintsChange: (next: boolean) => void;
  maxAttempts: number;
  onMaxAttemptsChange: (next: number) => void;
  difficulty: Difficulty;
  onDifficultyChange: (next: Difficulty) => void;
  canGenerate: boolean;
  onGenerate: () => void;
}) {
  const [attemptsDraft, setAttemptsDraft] = useState(String(maxAttempts));
  const [previousMaxAttempts, setPreviousMaxAttempts] = useState(maxAttempts);

  if (previousMaxAttempts !== maxAttempts) {
    setPreviousMaxAttempts(maxAttempts);
    setAttemptsDraft(String(maxAttempts));
  }

  const selected = lengthWords.find((entry) => entry.id === wordId) ?? lengthWords[0];

  function commitAttempts() {
    const parsed = Number.parseInt(attemptsDraft, 10);
    const clamped = clampMaxAttempts(parsed);
    onMaxAttemptsChange(clamped);
    setAttemptsDraft(String(clamped));
  }

  function changeDifficulty(next: Difficulty) {
    onDifficultyChange(next);
    const preset = DIFFICULTY_PRESETS[next];
    onMaxAttemptsChange(preset.maxAttempts);
    onShowHintsChange(preset.showHints);
  }

  return (
    <SectionCard
      title="Configure activity"
      description="Choose a phoneme length and an HCE corpus word. The live preview updates as you go."
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

        <HintToggle
          value={showHints}
          onChange={onShowHintsChange}
          name="show-hints"
          description="When on, phoneme buttons show tooltips such as /θ/ → TH (as in thin) on hover or keyboard focus."
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            label="Number of guesses"
            hint="Rows in the Wordle grid. Values below 1 are prevented."
          >
            {(id) => (
              <input
                id={id}
                className={inputClass}
                type="number"
                min={1}
                max={10}
                step={1}
                value={attemptsDraft}
                onChange={(event) => setAttemptsDraft(event.target.value)}
                onBlur={commitAttempts}
              />
            )}
          </Field>

          <Field
            label="Difficulty"
            hint="Presets hints and guess count. Both stay adjustable afterwards."
          >
            {(id) => (
              <select
                id={id}
                className={inputClass}
                value={difficulty}
                onChange={(event) =>
                  changeDifficulty(event.target.value as Difficulty)
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
        </div>

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
