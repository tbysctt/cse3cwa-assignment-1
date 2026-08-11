"use client";

import { useMemo, useState } from "react";
import { PhonemeGlyph } from "@/components/phoneme/PhonemeGlyph";
import { PhonemeWordRow } from "@/components/phoneme/PhonemeWordRow";
import { downloadTextFile } from "@/lib/download";
import { generateWordleHtml } from "@/lib/generate-wordle-html";
import {
  PHONEME_INVENTORY,
  WORDLE_TARGET,
  type Phoneme,
} from "@/lib/phonemes";
import { tileStatusClass } from "@/lib/tile-styles";
import {
  ATTEMPT_OPTIONS,
  DEFAULT_MAX_ATTEMPTS,
  evaluateGuess,
  isWinningGuess,
  type GuessResult,
} from "@/lib/wordle";

type SubmittedRow = {
  guess: Phoneme[];
  result: GuessResult;
};

export function WordleBuilder() {
  const [maxAttempts, setMaxAttempts] = useState<number>(DEFAULT_MAX_ATTEMPTS);
  const [current, setCurrent] = useState<Phoneme[]>([]);
  const [submitted, setSubmitted] = useState<SubmittedRow[]>([]);
  const [message, setMessage] = useState("");
  const [won, setWon] = useState(false);

  const length = WORDLE_TARGET.phonemes.length;
  const locked = won || submitted.length >= maxAttempts;
  const inventory = useMemo(() => {
    const map = new Map<string, Phoneme>();
    for (const p of [...PHONEME_INVENTORY, ...WORDLE_TARGET.phonemes]) {
      map.set(p.ipa, p);
    }
    return [...map.values()];
  }, []);

  function resetGame() {
    setCurrent([]);
    setSubmitted([]);
    setMessage("");
    setWon(false);
  }

  function pushPhoneme(phoneme: Phoneme) {
    if (locked || current.length >= length) return;
    setCurrent((prev) => [...prev, phoneme]);
    setMessage("");
  }

  function deletePhoneme() {
    if (locked || current.length === 0) return;
    setCurrent((prev) => prev.slice(0, -1));
  }

  function submitGuess() {
    if (locked) return;
    if (current.length < length) {
      setMessage("Fill every phoneme slot before submitting.");
      return;
    }
    const result = evaluateGuess(current, WORDLE_TARGET);
    const next = [...submitted, { guess: current, result }];
    setSubmitted(next);
    setCurrent([]);
    if (isWinningGuess(result)) {
      setWon(true);
      setMessage(`Correct! English spelling: ${WORDLE_TARGET.english}`);
      return;
    }
    if (next.length >= maxAttempts) {
      setMessage(
        `Out of attempts. Answer: ${WORDLE_TARGET.phonemes
          .map((p) => `/${p.ipa}/`)
          .join(" ")} (${WORDLE_TARGET.english})`,
      );
    }
  }

  function handleGenerate() {
    const html = generateWordleHtml({
      target: WORDLE_TARGET,
      inventory,
      maxAttempts,
      title: "Phoneme Wordle Classroom Activity",
    });
    downloadTextFile("phoneme-wordle.html", html);
  }

  const rows = Array.from({ length: maxAttempts }, (_, rowIndex) => {
    const submittedRow = submitted[rowIndex];
    const isCurrent = rowIndex === submitted.length && !locked;
    return { submittedRow, isCurrent };
  });

  return (
    <div className="flex flex-col gap-[var(--section-gap)]">
      <section className="rounded-xl border border-border bg-surface p-4 sm:p-6">
        <h2 className="text-lg font-semibold">Builder settings</h2>
        <p className="mt-1 text-sm text-absent">
          Assessment 1 uses a single fixed phoneme word. Choose difficulty
          (maximum attempts), preview the activity, then generate a downloadable
          HTML file.
        </p>
        <div className="mt-4 flex flex-wrap items-end gap-4">
          <label className="flex flex-col gap-1 text-sm font-medium">
            Max attempts
            <select
              className="rounded-md border border-border bg-background px-3 py-2"
              value={maxAttempts}
              onChange={(event) => {
                setMaxAttempts(Number(event.target.value));
                resetGame();
              }}
            >
              {ATTEMPT_OPTIONS.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-surface-muted"
            onClick={resetGame}
          >
            Reset preview
          </button>
          <button
            type="button"
            className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-contrast hover:bg-accent-hover"
            onClick={handleGenerate}
          >
            Generate HTML
          </button>
        </div>
        <div className="mt-4">
          <p className="mb-2 text-sm font-medium">Target phoneme word</p>
          <PhonemeWordRow word={WORDLE_TARGET} revealEnglish={won} />
        </div>
      </section>

      <section className="rounded-xl border border-border bg-surface p-4 sm:p-6">
        <h2 className="text-lg font-semibold">Live preview</h2>
        <p className="mt-1 text-sm text-absent">
          Hover or focus a phoneme for its English letter equivalence.
        </p>

        <div
          className="mt-4 grid gap-2"
          style={{
            gridTemplateColumns: `repeat(${length}, minmax(2.75rem, 1fr))`,
            maxWidth: `${length * 4.25}rem`,
          }}
          role="group"
          aria-label="Wordle board"
        >
          {rows.map(({ submittedRow, isCurrent }, rowIndex) =>
            Array.from({ length }, (_, colIndex) => {
              const phoneme = submittedRow
                ? submittedRow.guess[colIndex]
                : isCurrent
                  ? current[colIndex]
                  : undefined;
              const status = submittedRow?.result[colIndex];
              return (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className={[
                    "flex min-h-12 flex-col items-center justify-center rounded-md border-2 font-mono text-base",
                    tileStatusClass(status),
                  ].join(" ")}
                  title={
                    phoneme
                      ? `/${phoneme.ipa}/ → ${phoneme.grapheme} (${phoneme.example})`
                      : undefined
                  }
                >
                  {phoneme ? (
                    <>
                      <span>/{phoneme.ipa}/</span>
                      <span className="mt-0.5 text-[0.65rem] font-sans font-semibold uppercase opacity-90">
                        {phoneme.grapheme}
                      </span>
                    </>
                  ) : (
                    <span className="opacity-30">·</span>
                  )}
                </div>
              );
            }),
          )}
        </div>

        <div
          className="mt-6 flex flex-wrap gap-2"
          role="group"
          aria-label="Phoneme keyboard"
        >
          {inventory.map((phoneme) => (
            <PhonemeGlyph
              key={phoneme.ipa}
              phoneme={phoneme}
              as="button"
              showGrapheme
              disabled={locked}
              onClick={() => pushPhoneme(phoneme)}
            />
          ))}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-contrast hover:bg-accent-hover disabled:opacity-50"
            onClick={submitGuess}
            disabled={locked}
          >
            Enter
          </button>
          <button
            type="button"
            className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-surface-muted disabled:opacity-50"
            onClick={deletePhoneme}
            disabled={locked}
          >
            Delete
          </button>
        </div>

        <p className="mt-4 min-h-6 text-sm font-semibold" role="status" aria-live="polite">
          {message}
        </p>
      </section>
    </div>
  );
}
