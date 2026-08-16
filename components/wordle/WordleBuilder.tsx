"use client";

import { useMemo, useState } from "react";
import { BuilderLayout } from "@/components/shared/BuilderLayout";
import { WordleActivityPreview } from "@/components/wordle/WordleActivityPreview";
import { WordleConfigForm } from "@/components/wordle/WordleConfigForm";
import {
  HCE_PHONEME_INVENTORY,
  WORDLE_TARGET,
  type PhonemeLength,
  type PhonemeWord,
  wordsForLength,
} from "@/data/phonemes";
import { type Difficulty } from "@/lib/activity";
import { generateWordleHtml } from "@/lib/generate-wordle-html";
import { DIFFICULTY_PRESETS } from "@/lib/wordle";
import { downloadTextFile } from "@/lib/download";

export function WordleBuilder() {
  const [length, setLength] = useState<PhonemeLength>(
    WORDLE_TARGET.phonemes.length as PhonemeLength,
  );
  const [wordId, setWordId] = useState(WORDLE_TARGET.id);
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");

  const lengthWords = useMemo(() => wordsForLength(length), [length]);

  const targetWord = useMemo<PhonemeWord>(() => {
    return lengthWords.find((entry) => entry.id === wordId) ?? lengthWords[0];
  }, [lengthWords, wordId]);

  const inventory = HCE_PHONEME_INVENTORY;
  const preset = DIFFICULTY_PRESETS[difficulty];
  const canGenerate = Boolean(targetWord);

  function handleLengthChange(next: PhonemeLength) {
    setLength(next);
    const nextWords = wordsForLength(next);
    setWordId(nextWords[0]?.id ?? "");
  }

  function handleGenerate() {
    if (!canGenerate) return;
    const html = generateWordleHtml({
      target: targetWord,
      inventory,
      maxAttempts: preset.maxAttempts,
      difficulty,
      showHints: preset.showHints,
    });
    downloadTextFile("phoneme-wordle.html", html);
  }

  return (
    <BuilderLayout
      config={
        <WordleConfigForm
          length={length}
          onLengthChange={handleLengthChange}
          wordId={targetWord.id}
          onWordIdChange={setWordId}
          lengthWords={lengthWords}
          difficulty={difficulty}
          onDifficultyChange={setDifficulty}
          canGenerate={canGenerate}
          onGenerate={handleGenerate}
        />
      }
      preview={
        <WordleActivityPreview
          target={targetWord}
          inventory={inventory}
          maxAttempts={preset.maxAttempts}
          showHints={preset.showHints}
        />
      }
    />
  );
}
