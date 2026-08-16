"use client";

import { useRef, useState } from "react";
import type { Phoneme, PhonemeWord } from "@/data/phonemes";
import { formatIpa } from "@/data/phonemes";
import {
  matchSelection,
  type WordSearchPuzzle,
} from "@/lib/word-search";

export function WordSearchGame({
  puzzle,
  words,
  showHints,
}: {
  puzzle: WordSearchPuzzle;
  words: PhonemeWord[];
  showHints: boolean;
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const [foundIds, setFoundIds] = useState<Set<string>>(new Set());
  const [foundCells, setFoundCells] = useState<Set<string>>(new Set());
  const [dragging, setDragging] = useState(false);
  const [message, setMessage] = useState("");
  const selectedRef = useRef<string[]>([]);
  const foundIdsRef = useRef<Set<string>>(new Set());
  const pointerIntentRef = useRef(false);

  function cellKey(row: number, col: number) {
    return `${row}-${col}`;
  }

  function setSelectedKeys(keys: string[]) {
    selectedRef.current = keys;
    setSelected(keys);
  }

  function tryMatch(keys: string[]) {
    const match = matchSelection(
      keys,
      puzzle.placements.filter((p) => !foundIdsRef.current.has(p.word.id)),
    );
    if (!match) return;
    const nextFound = new Set(foundIdsRef.current).add(match.word.id);
    foundIdsRef.current = nextFound;
    setFoundIds(nextFound);
    setFoundCells((prev) => {
      const next = new Set(prev);
      for (const key of keys) next.add(key);
      return next;
    });
    setSelectedKeys([]);
    setMessage(
      nextFound.size === words.length
        ? "Well done — all phoneme words found!"
        : `Found “${match.word.english}”!`,
    );
  }

  function toggleCell(row: number, col: number) {
    const key = cellKey(row, col);
    const prev = selectedRef.current;
    const next = prev.includes(key)
      ? prev.filter((item) => item !== key)
      : [...prev, key];
    setSelectedKeys(next);
    tryMatch(next);
  }

  function addWhileDragging(row: number, col: number) {
    const key = cellKey(row, col);
    if (selectedRef.current.includes(key)) return;
    setSelectedKeys([...selectedRef.current, key]);
  }

  function reset() {
    setSelectedKeys([]);
    foundIdsRef.current = new Set();
    setFoundIds(new Set());
    setFoundCells(new Set());
    setMessage("");
  }

  return (
    <div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_15rem] lg:items-start">
      <div className="min-w-0">
        <div
          className="grid gap-2"
          style={{
            gridTemplateColumns: `repeat(${puzzle.size}, minmax(2.3rem, 1fr))`,
          }}
          onPointerLeave={() => setDragging(false)}
          onPointerUp={() => {
            if (dragging) {
              setDragging(false);
              tryMatch(selectedRef.current);
            }
          }}
          onPointerCancel={() => setDragging(false)}
        >
          {puzzle.grid.map((row, rowIndex) =>
            row.map((cell, colIndex) => {
              const key = cellKey(rowIndex, colIndex);
              const isSelected = selected.includes(key);
              const isFound = foundCells.has(key);
              const phoneme: Phoneme | null = cell;
              const hint = phoneme
                ? `${formatIpa(phoneme.ipa)} → ${phoneme.grapheme} (${phoneme.example})`
                : "";
              return (
                <button
                  key={key}
                  type="button"
                  className={[
                    "relative flex min-h-12 flex-col items-center justify-center rounded-[var(--control-radius)] border font-mono text-sm transition-colors",
                    isFound
                      ? "border-correct bg-correct/20"
                      : isSelected
                        ? "border-accent bg-accent/20 shadow-[inset_0_0_0_2px_var(--accent)]"
                        : "border-border bg-background hover:bg-surface-muted",
                    "touch-none",
                  ].join(" ")}
                  aria-pressed={isSelected || isFound}
                  aria-label={showHints && hint ? hint : phoneme ? formatIpa(phoneme.ipa) : ""}
                  title={showHints && hint ? hint : undefined}
                  onPointerDown={(event) => {
                    if (event.button !== 0) return;
                    event.preventDefault();
                    pointerIntentRef.current = true;
                    setDragging(true);
                    setSelectedKeys([key]);
                  }}
                  onPointerEnter={() => {
                    if (dragging) addWhileDragging(rowIndex, colIndex);
                  }}
                  onClick={() => {
                    if (pointerIntentRef.current) {
                      pointerIntentRef.current = false;
                      return;
                    }
                    toggleCell(rowIndex, colIndex);
                  }}
                >
                  <span aria-hidden="true">
                    {phoneme ? formatIpa(phoneme.ipa) : ""}
                  </span>
                  <span className="text-[0.6rem] font-sans font-semibold uppercase tracking-wide text-absent">
                    {phoneme?.grapheme}
                  </span>
                  {isFound ? (
                    <span
                      aria-hidden="true"
                      className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-correct text-[0.6rem] font-bold text-white"
                    >
                      ✓
                    </span>
                  ) : null}
                </button>
              );
            }),
          )}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            className="ui-button ui-button-secondary px-4 py-2"
            onClick={() => {
              setSelectedKeys([]);
              setMessage("");
            }}
          >
            Clear selection
          </button>
          <button
            type="button"
            className="ui-button ui-button-secondary px-4 py-2"
            onClick={reset}
          >
            Reset activity
          </button>
        </div>
      </div>

      <aside>
        <h3 className="text-base font-semibold text-foreground">
          Find these words
        </h3>
        <ul className="mt-3 space-y-2">
          {words.map((word) => {
            const done = foundIds.has(word.id);
            return (
              <li
                key={word.id}
                className={[
                  "rounded-[var(--surface-radius)] border border-border p-3",
                  done ? "border-correct/50 bg-correct/10" : "bg-background",
                ].join(" ")}
              >
                <div className="flex flex-wrap gap-1">
                  {word.phonemes.map((phoneme, index) => (
                    <span
                      key={`${index}-${phoneme.ipa}`}
                      className="inline-flex min-h-8 min-w-8 items-center justify-center rounded-[var(--control-radius)] border border-border bg-surface px-1.5 font-mono text-sm"
                    >
                      {formatIpa(phoneme.ipa)}
                    </span>
                  ))}
                </div>
                {done ? (
                  <p className="mt-2 text-sm font-semibold text-correct">
                    English: {word.english}
                  </p>
                ) : (
                  <p className="mt-2 text-xs text-absent">
                    {word.phonemes.length} phonemes
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      </aside>
      </div>

      <p
        role="status"
        aria-live="polite"
        className="mt-4 min-h-6 text-sm font-semibold text-foreground"
      >
        {message}
      </p>
    </div>
  );
}
