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

/** Shared phoneme inventory used by Wordle keyboard and Word Search filler cells. */
export const PHONEME_INVENTORY: Phoneme[] = [
    { ipa: "θ", grapheme: "TH", example: "as in thin" },
    { ipa: "ɪ", grapheme: "I", example: "as in thin" },
    { ipa: "n", grapheme: "N", example: "as in thin" },
    { ipa: "ʃ", grapheme: "SH", example: "as in ship" },
    { ipa: "p", grapheme: "P", example: "as in ship" },
    { ipa: "tʃ", grapheme: "CH", example: "as in chip" },
    { ipa: "k", grapheme: "K", example: "as in think" },
    { ipa: "f", grapheme: "F", example: "as in fish" },
    { ipa: "s", grapheme: "S", example: "as in fish" },
    { ipa: "æ", grapheme: "A", example: "as in cat" },
    { ipa: "i", grapheme: "EE", example: "as in sheep" },
    { ipa: "m", grapheme: "M", example: "as in mat" },
];

export function formatIpa(ipa: string): string {
    return `/${ipa}/`;
}

export function hintLabel(phoneme: Phoneme): string {
    return `${formatIpa(phoneme.ipa)} → ${phoneme.grapheme} (${phoneme.example})`;
}

export function phonemeWordDisplay(word: PhonemeWord): string {
    return word.phonemes.map((p) => formatIpa(p.ipa)).join(" ");
}

/** Assessment 1: single fixed Wordle target. */
export const WORDLE_TARGET: PhonemeWord = {
    id: "thin",
    english: "thin",
    phonemes: [
        { ipa: "θ", grapheme: "TH", example: "as in thin" },
        { ipa: "ɪ", grapheme: "I", example: "as in thin" },
        { ipa: "n", grapheme: "N", example: "as in thin" },
    ],
};

/** Assessment 1: fixed ~5-word Word Search list. */
export const WORD_SEARCH_WORDS: PhonemeWord[] = [
    {
        id: "thin",
        english: "thin",
        phonemes: [
            { ipa: "θ", grapheme: "TH", example: "as in thin" },
            { ipa: "ɪ", grapheme: "I", example: "as in thin" },
            { ipa: "n", grapheme: "N", example: "as in thin" },
        ],
    },
    {
        id: "ship",
        english: "ship",
        phonemes: [
            { ipa: "ʃ", grapheme: "SH", example: "as in ship" },
            { ipa: "ɪ", grapheme: "I", example: "as in ship" },
            { ipa: "p", grapheme: "P", example: "as in ship" },
        ],
    },
    {
        id: "chip",
        english: "chip",
        phonemes: [
            { ipa: "tʃ", grapheme: "CH", example: "as in chip" },
            { ipa: "ɪ", grapheme: "I", example: "as in chip" },
            { ipa: "p", grapheme: "P", example: "as in chip" },
        ],
    },
    {
        id: "think",
        english: "think",
        phonemes: [
            { ipa: "θ", grapheme: "TH", example: "as in think" },
            { ipa: "ɪ", grapheme: "I", example: "as in think" },
            { ipa: "ŋ", grapheme: "NG", example: "as in think" },
            { ipa: "k", grapheme: "K", example: "as in think" },
        ],
    },
    {
        id: "fish",
        english: "fish",
        phonemes: [
            { ipa: "f", grapheme: "F", example: "as in fish" },
            { ipa: "ɪ", grapheme: "I", example: "as in fish" },
            { ipa: "ʃ", grapheme: "SH", example: "as in fish" },
        ],
    },
];

/** Extra phoneme used only in think (ŋ) — ensure inventory covers fillers. */
export const EXTRA_FILLERS: Phoneme[] = [
    { ipa: "ŋ", grapheme: "NG", example: "as in think" },
    { ipa: "b", grapheme: "B", example: "as in bat" },
    { ipa: "d", grapheme: "D", example: "as in dog" },
    { ipa: "g", grapheme: "G", example: "as in go" },
    { ipa: "l", grapheme: "L", example: "as in lip" },
    { ipa: "ɹ", grapheme: "R", example: "as in red" },
];

export function allFillerPhonemes(): Phoneme[] {
    const map = new Map<string, Phoneme>();
    for (const p of [...PHONEME_INVENTORY, ...EXTRA_FILLERS]) {
        map.set(p.ipa, p);
    }
    for (const word of WORD_SEARCH_WORDS) {
        for (const p of word.phonemes) {
            map.set(p.ipa, p);
        }
    }
    return [...map.values()];
}
