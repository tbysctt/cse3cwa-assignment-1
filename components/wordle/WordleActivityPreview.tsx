"use client";

import type { Phoneme, PhonemeWord } from "@/data/phonemes";
import { WordleGame } from "./WordleGame";

/**
 * Wraps the playable Wordle game in a visually distinct "Activity Preview"
 * card so teachers can clearly tell the editor apart from the student-facing
 * output. The game is remounted whenever the target word or guess count
 * changes so editing the configuration does not corrupt an active game.
 */
export function WordleActivityPreview({
  target,
  inventory,
  maxAttempts,
  showHints,
}: {
  target: PhonemeWord;
  inventory: Phoneme[];
  maxAttempts: number;
  showHints: boolean;
}) {
  const gameKey = `${target.phonemes.map((p) => p.ipa).join("")}|${maxAttempts}`;

  return (
    <section
      aria-label="Activity preview"
      className="ui-surface ui-surface-pad"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Activity Preview</h2>
        <span className="rounded-full border border-accent/40 bg-accent/10 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-accent">
          Student view
        </span>
      </div>
      <p className="mt-1 text-sm text-absent">
        This is exactly what students will see and play.
        {showHints
          ? " Hover or focus a phoneme key for a hint."
          : " Phoneme hints are currently switched off."}
      </p>
      <div className="mt-5">
        <WordleGame
          key={gameKey}
          target={target}
          inventory={inventory}
          maxAttempts={maxAttempts}
          showHints={showHints}
        />
      </div>
    </section>
  );
}
