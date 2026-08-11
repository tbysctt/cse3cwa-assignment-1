import type { PhonemeWord } from "@/lib/phonemes";
import { phonemeWordDisplay } from "@/lib/phonemes";
import { PhonemeGlyph } from "./PhonemeGlyph";

export function PhonemeWordRow({
  word,
  revealEnglish = false,
}: {
  word: PhonemeWord;
  revealEnglish?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <p className="sr-only">
        Phoneme word {phonemeWordDisplay(word)}
        {revealEnglish ? `, English ${word.english}` : ""}
      </p>
      {word.phonemes.map((phoneme) => (
        <PhonemeGlyph key={`${word.id}-${phoneme.ipa}`} phoneme={phoneme} />
      ))}
      {revealEnglish ? (
        <span className="ml-2 rounded-md bg-correct/15 px-2 py-1 text-sm font-semibold text-correct">
          English: {word.english}
        </span>
      ) : null}
    </div>
  );
}
