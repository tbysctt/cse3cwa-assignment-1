"use client";

import { useState } from "react";
import { PhonemePicker } from "@/components/phoneme/PhonemePicker";
import { Field } from "@/components/shared/Field";
import { SectionCard } from "@/components/shared/SectionCard";
import type { Phoneme } from "@/data/phonemes";
import {
  clampMaxAttempts,
  DIFFICULTY_OPTIONS,
  DIFFICULTY_PRESETS,
  type Difficulty,
} from "@/lib/wordle";

const inputClass =
  "ui-control w-full px-3 py-2 text-sm focus:border-accent focus:outline-none";

export function WordleConfigForm({
  target,
  onTargetChange,
  english,
  onEnglishChange,
  showHints,
  onShowHintsChange,
  maxAttempts,
  onMaxAttemptsChange,
  difficulty,
  onDifficultyChange,
  inventory,
  canGenerate,
  onGenerate,
}: {
  target: Phoneme[];
  onTargetChange: (next: Phoneme[]) => void;
  english: string;
  onEnglishChange: (next: string) => void;
  showHints: boolean;
  onShowHintsChange: (next: boolean) => void;
  maxAttempts: number;
  onMaxAttemptsChange: (next: number) => void;
  difficulty: Difficulty;
  onDifficultyChange: (next: Difficulty) => void;
  inventory: Phoneme[];
  canGenerate: boolean;
  onGenerate: () => void;
}) {
  const [attemptsDraft, setAttemptsDraft] = useState(String(maxAttempts));
  const [prevMaxAttempts, setPrevMaxAttempts] = useState(maxAttempts);

  if (prevMaxAttempts !== maxAttempts) {
    setPrevMaxAttempts(maxAttempts);
    setAttemptsDraft(String(maxAttempts));
  }

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
      description="Set the phoneme word, English answer, hints, difficulty and guess count. The live preview updates as you go."
    >
      <div className="flex flex-col gap-5">
        <fieldset>
          <legend className="text-sm font-semibold text-foreground">
            Phoneme Word
          </legend>
          <p className="mt-0.5 text-xs text-absent">
            The phonetic version students must guess, e.g. /θɪn/. Build it from
            the keys below — no typing of IPA symbols required.
          </p>
          <div className="mt-2">
            <PhonemePicker
              label="Target"
              phonemes={target}
              inventory={inventory}
              onChange={onTargetChange}
            />
          </div>
        </fieldset>

        <Field
          label="English Word"
          hint="The normal English equivalent, kept secret until the student completes the activity, e.g. thin."
        >
          {(id) => (
            <input
              id={id}
              className={inputClass}
              type="text"
              value={english}
              onChange={(event) => onEnglishChange(event.target.value)}
              placeholder="e.g. thin"
              autoComplete="off"
            />
          )}
        </Field>

        <fieldset>
          <legend className="text-sm font-semibold text-foreground">
            Show phoneme hints
          </legend>
          <p className="mt-0.5 text-xs text-absent">
            When on, phoneme buttons show tooltips such as /θ/ → TH (as in thin)
            on hover or keyboard focus.
          </p>
          <div
            className="mt-2 flex gap-4"
            role="radiogroup"
            aria-label="Show phoneme hints"
          >
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
                  name="show-hints"
                  className="size-4 accent-[var(--accent)]"
                  checked={showHints === option.value}
                  onChange={() => onShowHintsChange(option.value)}
                />
                {option.label}
              </label>
            ))}
          </div>
        </fieldset>

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
                : "Add a phoneme word and English word first"
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
