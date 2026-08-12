"use client";

import { useMemo, useState } from "react";
import { BuilderLayout } from "@/components/shared/BuilderLayout";
import { WordleActivityPreview } from "@/components/wordle/WordleActivityPreview";
import { WordleConfigForm } from "@/components/wordle/WordleConfigForm";
import { PHONEME_INVENTORY, WORDLE_TARGET, type Phoneme } from "@/data/phonemes";
import { generateWordleHtml } from "@/lib/generate-wordle-html";
import { DEFAULT_MAX_ATTEMPTS, type Difficulty } from "@/lib/wordle";
import { downloadTextFile } from "@/lib/download";

export function WordleBuilder() {
  const [target, setTarget] = useState<Phoneme[]>(WORDLE_TARGET.phonemes);
  const [english, setEnglish] = useState(WORDLE_TARGET.english);
  const [showHints, setShowHints] = useState(true);
  const [maxAttempts, setMaxAttempts] = useState(DEFAULT_MAX_ATTEMPTS);
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");

  const inventory = useMemo(() => {
    const map = new Map<string, Phoneme>();
    for (const p of [...PHONEME_INVENTORY, ...target]) {
      map.set(p.ipa, p);
    }
    return [...map.values()];
  }, [target]);

  const targetWord = useMemo(
    () => ({
      id: "custom",
      english: english.trim() || "thin",
      phonemes: target,
    }),
    [target, english],
  );

  const canGenerate = target.length > 0 && english.trim().length > 0;

  function handleGenerate() {
    if (!canGenerate) return;
    const html = generateWordleHtml({
      target: targetWord,
      inventory,
      maxAttempts,
      difficulty,
      showHints,
    });
    downloadTextFile("phoneme-wordle.html", html);
  }

  return (
    <BuilderLayout
      config={
        <WordleConfigForm
          target={target}
          onTargetChange={setTarget}
          english={english}
          onEnglishChange={setEnglish}
          showHints={showHints}
          onShowHintsChange={setShowHints}
          maxAttempts={maxAttempts}
          onMaxAttemptsChange={setMaxAttempts}
          difficulty={difficulty}
          onDifficultyChange={setDifficulty}
          inventory={inventory}
          canGenerate={canGenerate}
          onGenerate={handleGenerate}
        />
      }
      preview={
        <WordleActivityPreview
          target={targetWord}
          inventory={inventory}
          maxAttempts={maxAttempts}
          showHints={showHints}
        />
      }
    />
  );
}
