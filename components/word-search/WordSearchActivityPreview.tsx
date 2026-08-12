"use client";

import type { PhonemeWord } from "@/data/phonemes";
import type { WordSearchPuzzle } from "@/lib/word-search";
import { WordSearchGame } from "./WordSearchGame";

export function WordSearchActivityPreview({
  puzzle,
  words,
  showHints,
  puzzleKey,
}: {
  puzzle: WordSearchPuzzle | null;
  words: PhonemeWord[];
  showHints: boolean;
  puzzleKey: string;
}) {
  return (
    <section
      aria-label="Activity preview"
      className="rounded-xl border border-border bg-surface p-4 sm:p-6"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Activity Preview</h2>
        <span className="rounded-full border border-accent/40 bg-accent/10 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-accent">
          Student view
        </span>
      </div>
      <p className="mt-1 text-sm text-absent">
        The grid is generated from your word list. Select connected phonemes
        (click or drag) to find a word.
      </p>

      {puzzle ? (
        <div className="mt-5">
          <WordSearchGame
            key={puzzleKey}
            puzzle={puzzle}
            words={words}
            showHints={showHints}
          />
        </div>
      ) : (
        <p className="mt-5 rounded-md border border-danger/40 bg-danger/10 p-3 text-sm text-danger">
          Could not fit the current word list into the grid. Try shorter words
          or fewer of them.
        </p>
      )}
    </section>
  );
}
