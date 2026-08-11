import type { Phoneme, PhonemeWord } from "@/lib/phonemes";

export type TileStatus = "correct" | "present" | "absent";

export type GuessResult = TileStatus[];

export function evaluateGuess(
    guess: Phoneme[],
    target: PhonemeWord,
): GuessResult {
    const length = target.phonemes.length;
    const result: GuessResult = Array.from({ length }, () => "absent");
    const remaining = target.phonemes.map((p) => p.ipa);

    for (let i = 0; i < length; i += 1) {
        if (guess[i]?.ipa === target.phonemes[i].ipa) {
            result[i] = "correct";
            remaining[i] = "";
        }
    }

    for (let i = 0; i < length; i += 1) {
        if (result[i] === "correct") continue;
        const ipa = guess[i]?.ipa;
        if (!ipa) continue;
        const index = remaining.indexOf(ipa);
        if (index >= 0) {
            result[i] = "present";
            remaining[index] = "";
        }
    }

    return result;
}

export function isWinningGuess(result: GuessResult): boolean {
    return result.every((status) => status === "correct");
}

export const DEFAULT_MAX_ATTEMPTS = 6;
export const ATTEMPT_OPTIONS = [5, 6, 7] as const;
