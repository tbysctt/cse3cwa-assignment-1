"use client";

import { useMemo, useState } from "react";
import { BuilderLayout } from "@/components/shared/BuilderLayout";
import { WordSearchActivityPreview } from "@/components/word-search/WordSearchActivityPreview";
import { WordSearchConfigForm } from "@/components/word-search/WordSearchConfigForm";
import {
  findCorpusWord,
  WORD_SEARCH_WORDS,
  type PhonemeWord,
} from "@/data/phonemes";
import { downloadTextFile } from "@/lib/download";
import { generateWordSearchHtml } from "@/lib/generate-word-search-html";
import {
  activitySignature,
  type Difficulty,
} from "@/lib/activity";
import { DIFFICULTY_PRESETS } from "@/lib/wordle";
import {
  DEFAULT_WORD_SEARCH_SEED,
  generateWordSearch,
  GRID_SIZE_BY_DIFFICULTY,
  REQUIRED_WORD_COUNT,
  type WordSearchPuzzle,
} from "@/lib/word-search";

export function WordSearchBuilder() {
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [wordIds, setWordIds] = useState<string[]>(() =>
    WORD_SEARCH_WORDS.map((word) => word.id),
  );
  const gridSize = GRID_SIZE_BY_DIFFICULTY[difficulty];
  const showHints = DIFFICULTY_PRESETS[difficulty].showHints;

  const words = useMemo<PhonemeWord[]>(() => {
    return wordIds.flatMap((id) => {
      const match = findCorpusWord(id);
      return match ? [match] : [];
    });
  }, [wordIds]);

  const wordsSignature = useMemo(() => activitySignature(words), [words]);

  const puzzleResult = useMemo<{
    puzzle: WordSearchPuzzle | null;
    error: string | null;
  }>(() => {
    if (words.length !== REQUIRED_WORD_COUNT) {
      return { puzzle: null, error: null };
    }
    if (new Set(words.map((word) => word.id)).size !== REQUIRED_WORD_COUNT) {
      return {
        puzzle: null,
        error: "Choose five different corpus words.",
      };
    }
    try {
      return {
        puzzle: generateWordSearch(
          words,
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
  }, [words, gridSize]);
  const { puzzle } = puzzleResult;
  const canGenerate = puzzle !== null;

  function handleWordIdChange(index: number, nextId: string) {
    setWordIds((prev) => prev.map((id, i) => (i === index ? nextId : id)));
  }

  function handleGenerate() {
    if (!puzzle || !canGenerate) return;
    const html = generateWordSearchHtml({
      words,
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
          wordIds={wordIds}
          words={words}
          onWordIdChange={handleWordIdChange}
          difficulty={difficulty}
          onDifficultyChange={setDifficulty}
          canGenerate={canGenerate}
          generateHint={
            canGenerate
              ? "Download the word search as a standalone HTML file"
              : puzzleResult.error ??
                "Choose five different corpus words that fit the grid"
          }
          onGenerate={handleGenerate}
        />
      }
      preview={
        <WordSearchActivityPreview
          puzzle={puzzle}
          words={words}
          showHints={showHints}
          puzzleKey={`${wordsSignature}|${difficulty}|${gridSize}`}
          errorMessage={puzzleResult.error}
        />
      }
    />
  );
}
