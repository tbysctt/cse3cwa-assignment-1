"use client";

import { useEffect, useRef, useState } from "react";
import type { Phoneme, PhonemeWord } from "@/data/phonemes";
import { formatIpa } from "@/data/phonemes";
import {
  INVALID_SELECTION_FLASH_MS,
  cellsAlongSegment,
  cellKey,
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
  const [invalidKeys, setInvalidKeys] = useState<string[]>([]);
  const [foundIds, setFoundIds] = useState<Set<string>>(new Set());
  const [foundCells, setFoundCells] = useState<Set<string>>(new Set());
  const [message, setMessage] = useState("");
  const selectedRef = useRef<string[]>([]);
  const foundIdsRef = useRef<Set<string>>(new Set());
  const pointerIntentRef = useRef(false);
  const draggingRef = useRef(false);
  const anchorRef = useRef<string | null>(null);
  const selectionBeforePointerRef = useRef<string[]>([]);
  const invalidTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const invalidGenerationRef = useRef(0);

  function setSelectedKeys(keys: string[]) {
    selectedRef.current = keys;
    setSelected(keys);
  }

  function clearInvalidTimer() {
    if (invalidTimerRef.current !== null) {
      clearTimeout(invalidTimerRef.current);
      invalidTimerRef.current = null;
    }
  }

  function clearInvalidFeedback() {
    clearInvalidTimer();
    invalidGenerationRef.current += 1;
    setInvalidKeys([]);
  }

  function flashInvalidSelection(keys: string[]) {
    clearInvalidTimer();
    const snapshot = [...keys];
    const generation = invalidGenerationRef.current + 1;
    invalidGenerationRef.current = generation;
    setInvalidKeys(snapshot);
    setSelectedKeys(snapshot);
    invalidTimerRef.current = setTimeout(() => {
      if (invalidGenerationRef.current !== generation) return;
      setSelectedKeys([]);
      setInvalidKeys([]);
      invalidTimerRef.current = null;
    }, INVALID_SELECTION_FLASH_MS);
  }

  function tryMatch(keys: string[]): boolean {
    const match = matchSelection(
      keys,
      puzzle.placements.filter((p) => !foundIdsRef.current.has(p.word.id)),
    );
    if (!match) return false;
    clearInvalidFeedback();
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
    return true;
  }

  function commitSelection(keys: string[]) {
    if (keys.length === 0) return;
    if (tryMatch(keys)) return;
    if (keys.length === 1) {
      // Single-cell taps may leave a pending selection for further clicks.
      setSelectedKeys(keys);
      return;
    }
    flashInvalidSelection(keys);
  }

  function selectSegmentTo(targetKey: string) {
    const anchor = anchorRef.current;
    if (!anchor) return;
    const segment = cellsAlongSegment(anchor, targetKey);
    if (!segment) return;
    clearInvalidFeedback();
    setSelectedKeys(segment);
  }

  function toggleCell(row: number, col: number) {
    const key = cellKey(row, col);
    clearInvalidFeedback();
    const prev = selectedRef.current;

    if (prev.length === 0) {
      anchorRef.current = key;
      setSelectedKeys([key]);
      return;
    }

    const anchor = prev[0];
    if (prev.length === 1 && prev[0] === key) {
      anchorRef.current = null;
      setSelectedKeys([]);
      return;
    }

    const segment = cellsAlongSegment(anchor, key);
    if (!segment) {
      flashInvalidSelection(prev);
      anchorRef.current = null;
      return;
    }

    anchorRef.current = segment[0];
    setSelectedKeys(segment);
    commitSelection(segment);
  }

  useEffect(() => {
    function finishPointerSelection() {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      const keys = selectedRef.current;

      if (keys.length === 1) {
        const key = keys[0];
        const previous = selectionBeforePointerRef.current;
        const next = previous.includes(key)
          ? previous.filter((item) => item !== key)
          : [...previous, key];
        // Keep click-to-build geometry: a lone tap toggles against prior selection.
        if (next.length <= 1) {
          anchorRef.current = next[0] ?? null;
          clearInvalidFeedback();
          setSelectedKeys(next);
          tryMatch(next);
          return;
        }
        const built = cellsAlongSegment(next[0], next[next.length - 1]);
        if (!built || built.length !== next.length || !built.every((k, i) => k === next[i])) {
          // Prior multi-cell selection plus a tap that broke the line.
          flashInvalidSelection(next);
          anchorRef.current = null;
          return;
        }
        anchorRef.current = built[0];
        setSelectedKeys(built);
        commitSelection(built);
        return;
      }

      commitSelection(keys);
    }
    document.addEventListener("pointerup", finishPointerSelection);
    document.addEventListener("pointercancel", finishPointerSelection);
    return () => {
      document.removeEventListener("pointerup", finishPointerSelection);
      document.removeEventListener("pointercancel", finishPointerSelection);
    };
    // Gesture refs keep this listener stable across renders.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [puzzle, words]);

  useEffect(() => {
    return () => {
      clearInvalidTimer();
    };
  }, []);

  function reset() {
    clearInvalidFeedback();
    anchorRef.current = null;
    setSelectedKeys([]);
    foundIdsRef.current = new Set();
    setFoundIds(new Set());
    setFoundCells(new Set());
    setMessage("");
  }

  function clearSelection() {
    clearInvalidFeedback();
    anchorRef.current = null;
    setSelectedKeys([]);
    setMessage("");
  }

  return (
    <div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_15rem] lg:items-start">
      <div className="min-w-0">
        <div className="overflow-x-auto pb-1">
        <div
          className="grid gap-1.5"
          style={{
            gridTemplateColumns: `repeat(${puzzle.size}, minmax(2rem, 1fr))`,
            minWidth: `${puzzle.size * 2.5}rem`,
          }}
        >
          {puzzle.grid.map((row, rowIndex) =>
            row.map((cell, colIndex) => {
              const key = cellKey(rowIndex, colIndex);
              const isSelected = selected.includes(key);
              const isInvalid = invalidKeys.includes(key);
              const isFound = foundCells.has(key);
              const phoneme: Phoneme | null = cell;
              const hint = phoneme
                ? `${formatIpa(phoneme.ipa)} → ${phoneme.grapheme} (${phoneme.example})`
                : "";
              return (
                <button
                  key={key}
                  type="button"
                  data-key={key}
                  data-invalid={isInvalid ? "true" : undefined}
                  className={[
                    "relative flex min-h-12 flex-col items-center justify-center rounded-[var(--control-radius)] border font-mono text-sm transition-colors",
                    isFound
                      ? "border-correct bg-correct/20"
                      : isInvalid
                        ? "border-danger bg-danger/25 shadow-[inset_0_0_0_2px_var(--danger)] animate-pulse"
                        : isSelected
                          ? "border-accent bg-accent/20 shadow-[inset_0_0_0_2px_var(--accent)]"
                          : "border-border bg-background hover:bg-surface-muted",
                    "touch-none",
                  ].join(" ")}
                  aria-pressed={isSelected || isInvalid}
                  aria-label={[
                    showHints && hint
                      ? hint
                      : phoneme
                        ? formatIpa(phoneme.ipa)
                        : "",
                    isFound ? "found" : "",
                    isInvalid ? "not a match" : "",
                  ]
                    .filter(Boolean)
                    .join(", ")}
                  title={showHints && hint ? hint : undefined}
                  onPointerDown={(event) => {
                    if (event.button !== 0) return;
                    event.preventDefault();
                    clearInvalidFeedback();
                    pointerIntentRef.current = true;
                    draggingRef.current = true;
                    selectionBeforePointerRef.current = selectedRef.current;
                    anchorRef.current = key;
                    setSelectedKeys([key]);
                  }}
                  onPointerEnter={() => {
                    if (!draggingRef.current) return;
                    selectSegmentTo(key);
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
                  {showHints ? (
                    <span className="text-[0.65rem] font-sans font-semibold uppercase tracking-wide text-absent">
                      {phoneme?.grapheme}
                    </span>
                  ) : null}
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
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            className="ui-button ui-button-secondary px-4 py-2"
            onClick={clearSelection}
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
