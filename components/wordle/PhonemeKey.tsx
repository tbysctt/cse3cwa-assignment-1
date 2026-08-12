import { PhonemeGlyph } from "@/components/phoneme/PhonemeGlyph";
import type { Phoneme } from "@/data/phonemes";

export function PhonemeKey({
  phoneme,
  showHint,
  disabled,
  onPress,
}: {
  phoneme: Phoneme;
  showHint: boolean;
  disabled?: boolean;
  onPress: () => void;
}) {
  return (
    <PhonemeGlyph
      as="button"
      phoneme={phoneme}
      showGrapheme
      showHint={showHint}
      disabled={disabled}
      onClick={onPress}
    />
  );
}
