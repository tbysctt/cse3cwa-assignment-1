"use client";

import { useMemo, useState } from "react";
import { BuilderLayout } from "@/components/shared/BuilderLayout";
import { WordSearchActivityPreview } from "@/components/word-search/WordSearchActivityPreview";
import { WordSearchConfigForm } from "@/components/word-search/WordSearchConfigForm";
import type { PhonemeWord } from "@/data/phonemes";
import {
  PHONEME_INVENTORY,
  WORD_SEARCH_WORDS,
} from "@/data/phonemes";
import { downloadTextFile } from "@/lib/download";
import { generateWordSearchHtml } from "@/lib/generate-word-search-html";
import {
  activitySignature,
  uniquePhonemes,
  type Difficulty,
} from "@/lib/activity";
import {
  DEFAULT_WORD_SEARCH_SEED,
  generateWordSearch,
  GRID_SIZE_BY_DIFFICULTY,
  REQUIRED_WORD_COUNT,
  type WordSearchPuzzle,
} from "@/lib/word-search";
import type { WordSearchRow } from "./PhonemeWordListEditor";

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
    return uniquePhonemes(
      PHONEME_INVENTORY,
      rows.flatMap((row) => row.phonemes),
    );
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

  const wordsSignature = useMemo(() => activitySignature(validWords), [validWords]);

  const puzzleResult = useMemo<{
    puzzle: WordSearchPuzzle | null;
    error: string | null;
  }>(() => {
    if (validWords.length !== REQUIRED_WORD_COUNT) {
      return { puzzle: null, error: null };
    }
    try {
      return {
        puzzle: generateWordSearch(
          validWords,
          gridSize,
          DEFAULT_WORD_SEARCH_SEED,
        ),
        error: null,
      };
    } catch (error) {
      return {
        puzzle: null,
        error:
          error instanceof Error
            ? error.message
            : "The word search could not be generated.",
      };
    }
  }, [validWords, gridSize]);
  const { puzzle } = puzzleResult;

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
      seed: DEFAULT_WORD_SEARCH_SEED,
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
          errorMessage={puzzleResult.error}
        />
      }
    />
  );
}
