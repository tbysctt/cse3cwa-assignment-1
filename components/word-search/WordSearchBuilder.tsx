"use client";

import { useMemo, useRef, useState } from "react";
import { PhonemeGlyph } from "@/components/phoneme/PhonemeGlyph";
import { downloadTextFile } from "@/lib/download";
import { generateWordSearchHtml } from "@/lib/generate-word-search-html";
import { WORD_SEARCH_WORDS, phonemeWordDisplay } from "@/lib/phonemes";
import {
  generateWordSearch,
  matchSelection,
} from "@/lib/word-search";

const SEED = 42;

export function WordSearchBuilder() {
  const puzzle = useMemo(
    () => generateWordSearch(WORD_SEARCH_WORDS, 8, SEED),
    [],
  );
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
      nextFound.size === WORD_SEARCH_WORDS.length
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

  function handleGenerate() {
    const html = generateWordSearchHtml({
      words: WORD_SEARCH_WORDS,
      puzzle,
      seed: SEED,
      title: "Phoneme Word Search Classroom Activity",
    });
    downloadTextFile("phoneme-word-search.html", html);
  }

  return (
    <div className="flex flex-col gap-[var(--section-gap)]">
      <section className="rounded-xl border border-border bg-surface p-4 sm:p-6">
        <h2 className="text-lg font-semibold">Builder settings</h2>
        <p className="mt-1 text-sm text-absent">
          Assessment 1 uses a fixed list of five phoneme-based words. Preview the
          generated grid, then download a single playable HTML file.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-surface-muted"
            onClick={() => {
              setSelectedKeys([]);
              setFoundIds(new Set());
              foundIdsRef.current = new Set();
              setFoundCells(new Set());
              setMessage("");
            }}
          >
            Reset preview
          </button>
          <button
            type="button"
            className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-surface-muted"
            onClick={() => {
              setSelectedKeys([]);
              setMessage("");
            }}
          >
            Clear selection
          </button>
          <button
            type="button"
            className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-contrast hover:bg-accent-hover"
            onClick={handleGenerate}
          >
            Generate HTML
          </button>
        </div>
      </section>

      <section className="grid gap-6 rounded-xl border border-border bg-surface p-4 lg:grid-cols-[1fr_16rem] sm:p-6">
        <div>
          <h2 className="text-lg font-semibold">Live preview</h2>
          <p className="mt-1 text-sm text-absent">
            Tap cells or click-and-drag to select a phoneme sequence. Hover for
            letter hints such as /θ/ → TH (as in thin).
          </p>
          <div
            className="mt-4 grid gap-1"
            style={{
              gridTemplateColumns: `repeat(${puzzle.size}, minmax(2.4rem, 1fr))`,
              maxWidth: "36rem",
            }}
            role="grid"
            aria-label="Word search grid"
            onMouseLeave={() => setDragging(false)}
            onMouseUp={() => {
              if (dragging) {
                setDragging(false);
                tryMatch(selectedRef.current);
              }
            }}
          >
            {puzzle.grid.map((row, rowIndex) =>
              row.map((cell, colIndex) => {
                const key = cellKey(rowIndex, colIndex);
                const isSelected = selected.includes(key);
                const isFound = foundCells.has(key);
                return (
                  <button
                    key={key}
                    type="button"
                    role="gridcell"
                    className={[
                      "relative flex min-h-11 flex-col items-center justify-center rounded-md border font-mono text-sm transition-colors",
                      isFound
                        ? "border-correct bg-correct/20"
                        : isSelected
                          ? "border-accent bg-accent/20"
                          : "border-border bg-background hover:bg-surface-muted",
                    ].join(" ")}
                    title={`/${cell!.ipa}/ → ${cell!.grapheme} (${cell!.example})`}
                    aria-label={`/${cell!.ipa}/ → ${cell!.grapheme} (${cell!.example})`}
                    onMouseDown={(event) => {
                      event.preventDefault();
                      pointerIntentRef.current = true;
                      setDragging(true);
                      setSelectedKeys([key]);
                    }}
                    onMouseEnter={() => {
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
                    <span>/{cell!.ipa}/</span>
                    <span className="text-[0.6rem] font-sans font-semibold text-absent">
                      {cell!.grapheme}
                    </span>
                  </button>
                );
              }),
            )}
          </div>
          <p className="mt-4 min-h-6 text-sm font-semibold" role="status" aria-live="polite">
            {message}
          </p>
        </div>

        <aside>
          <h3 className="text-base font-semibold">Word list</h3>
          <ul className="mt-3 space-y-2">
            {WORD_SEARCH_WORDS.map((word) => {
              const done = foundIds.has(word.id);
              return (
                <li
                  key={word.id}
                  className={[
                    "rounded-lg border border-border p-3",
                    done ? "bg-correct/10 opacity-80" : "bg-background",
                  ].join(" ")}
                >
                  <div className="flex flex-wrap gap-1">
                    {word.phonemes.map((phoneme) => (
                      <PhonemeGlyph
                        key={`${word.id}-${phoneme.ipa}`}
                        phoneme={phoneme}
                        className="min-h-8 min-w-8 text-sm"
                      />
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-absent">
                    {phonemeWordDisplay(word)}
                  </p>
                  {done ? (
                    <p className="mt-1 text-sm font-semibold text-correct">
                      English: {word.english}
                    </p>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </aside>
      </section>
    </div>
  );
}
