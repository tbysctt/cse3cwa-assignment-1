import {
  HCE_CORPUS,
  HCE_WORDS_3,
  findCorpusWord,
  wordsForLength,
  type PhonemeLength,
} from "@/data/hce-corpus";
import {
  HCE_KEYBOARD_ROWS,
  HCE_PHONEME_INVENTORY,
  phonemeByIpa,
  resolveHcePhonemes,
} from "@/data/hce-keyboard";

export type Phoneme = {
  /** IPA symbol without slashes, e.g. "θ" */
  ipa: string;
  /** Classroom grapheme label, e.g. "TH" */
  grapheme: string;
  /** Example cue, e.g. "as in thin" */
  example: string;
};

export type PhonemeWord = {
  id: string;
  english: string;
  phonemes: Phoneme[];
};

export type { PhonemeLength };
export {
  HCE_CORPUS,
  HCE_KEYBOARD_ROWS,
  HCE_PHONEME_INVENTORY,
  HCE_WORDS_3,
  findCorpusWord,
  phonemeByIpa,
  resolveHcePhonemes,
  wordsForLength,
};

/** Shared phoneme inventory used by the Wordle keyboard and Word Search filler cells. */
export const PHONEME_INVENTORY: Phoneme[] = HCE_PHONEME_INVENTORY;

/**
 * Extra fillers kept for Word Search grid variety. The HCE inventory already
 * covers these symbols; this list remains empty so helpers stay stable.
 */
export const EXTRA_FILLERS: Phoneme[] = [];

export function formatIpa(ipa: string): string {
  return `/${ipa}/`;
}

export function phonemeWordDisplay(word: PhonemeWord): string {
  return word.phonemes.map((p) => formatIpa(p.ipa)).join(" ");
}

/** Human-readable hint such as "/θ/ → TH (as in thin)". */
export function hintLabel(phoneme: Phoneme): string {
  return `${formatIpa(phoneme.ipa)} → ${phoneme.grapheme} (${phoneme.example})`;
}

/** Default Wordle target from the HCE 3-phoneme corpus. */
export const WORDLE_TARGET: PhonemeWord = HCE_WORDS_3.find(
  (entry) => entry.id === "thin",
)!;

/**
 * Assessment default five-word Word Search list (editable in the builder).
 * Drawn from the HCE corpus where possible.
 */
export const WORD_SEARCH_WORDS: PhonemeWord[] = [
  findCorpusWord("thin")!,
  findCorpusWord("ship")!,
  findCorpusWord("chin")!,
  findCorpusWord("bank")!,
  findCorpusWord("fan")!,
];

export function allFillerPhonemes(): Phoneme[] {
  const map = new Map<string, Phoneme>();
  for (const p of [...PHONEME_INVENTORY, ...EXTRA_FILLERS]) {
    map.set(p.ipa, p);
  }
  for (const word of [...WORD_SEARCH_WORDS, ...HCE_CORPUS]) {
    for (const p of word.phonemes) {
      map.set(p.ipa, p);
    }
  }
  return [...map.values()];
}

/** Resolve a phoneme sequence (IPA strings) against the inventory, keeping order. */
export function resolvePhonemes(ipaSequence: string[]): Phoneme[] {
  return resolveHcePhonemes(ipaSequence);
}
