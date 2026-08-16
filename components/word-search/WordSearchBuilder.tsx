"use client";

import { useMemo, useState } from "react";
import { BuilderLayout } from "@/components/shared/BuilderLayout";
import { WordSearchActivityPreview } from "@/components/word-search/WordSearchActivityPreview";
import { WordSearchConfigForm } from "@/components/word-search/WordSearchConfigForm";
import type { Phoneme, PhonemeWord } from "@/data/phonemes";
import {
  PHONEME_INVENTORY,
  WORD_SEARCH_WORDS,
} from "@/data/phonemes";
import { downloadTextFile } from "@/lib/download";
import { generateWordSearchHtml } from "@/lib/generate-word-search-html";
import type { Difficulty } from "@/lib/wordle";
import { generateWordSearch, type WordSearchPuzzle } from "@/lib/word-search";
import type { WordSearchRow } from "./PhonemeWordListEditor";

const SEED = 42;
const REQUIRED_WORD_COUNT = 5;
const GRID_SIZE_BY_DIFFICULTY: Record<Difficulty, number> = {
  easy: 8,
  medium: 9,
  hard: 10,
};

export function WordSearchBuilder() {
  const [rows, setRows] = useState<WordSearchRow[]>(() =>
    WORD_SEARCH_WORDS.map((word) => ({
      id: word.id,
      english: word.english,
      phonemes: word.phonemes,
    })),
  );
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [showHints, setShowHints] = useState(true);
  const gridSize = GRID_SIZE_BY_DIFFICULTY[difficulty];

  const inventory = useMemo(() => {
    const map = new Map<string, Phoneme>();
    for (const p of PHONEME_INVENTORY) map.set(p.ipa, p);
    for (const row of rows) {
      for (const p of row.phonemes) map.set(p.ipa, p);
    }
    return [...map.values()];
  }, [rows]);

  const completeRows = useMemo(
    () =>
      rows.filter((row) => row.phonemes.length > 0 && row.english.trim().length > 0),
    [rows],
  );

  const validWords = useMemo<PhonemeWord[]>(
    () =>
      completeRows
        .map((row) => ({
          id: row.id,
          english: row.english.trim(),
          phonemes: row.phonemes,
        })),
    [completeRows],
  );

  const wordsSignature = useMemo(
    () =>
      validWords
        .map((w) => `${w.id}:${w.phonemes.map((p) => p.ipa).join("")}`)
        .join("|"),
    [validWords],
  );

  const puzzle = useMemo<WordSearchPuzzle | null>(() => {
    if (validWords.length !== REQUIRED_WORD_COUNT) return null;
    try {
      return generateWordSearch(validWords, gridSize, SEED);
    } catch {
      return null;
    }
  }, [validWords, gridSize]);

  const canGenerate =
    puzzle !== null && validWords.length === REQUIRED_WORD_COUNT;

  const generateHint =
    validWords.length !== REQUIRED_WORD_COUNT
      ? `Configure all ${REQUIRED_WORD_COUNT} words with phonemes and English labels first`
      : canGenerate
        ? "Download the word search as a standalone HTML file"
        : "Current words do not fit the selected grid size; shorten one or more words";

  function handleGenerate() {
    if (!puzzle || !canGenerate) return;
    const html = generateWordSearchHtml({
      words: validWords,
      puzzle,
      seed: SEED,
      difficulty,
      showHints,
    });
    downloadTextFile("phoneme-word-search.html", html);
  }

  return (
    <BuilderLayout
      config={
        <WordSearchConfigForm
          rows={rows}
          inventory={inventory}
          showHints={showHints}
          onShowHintsChange={setShowHints}
          difficulty={difficulty}
          onDifficultyChange={setDifficulty}
          onRowsChange={setRows}
          configuredCount={validWords.length}
          canGenerate={canGenerate}
          generateHint={generateHint}
          onGenerate={handleGenerate}
        />
      }
      preview={
        <WordSearchActivityPreview
          puzzle={puzzle}
          words={validWords}
          showHints={showHints}
          puzzleKey={`${wordsSignature}|${difficulty}|${gridSize}`}
        />
      }
    />
  );
}
