import type { Phoneme } from "@/data/phonemes";
import { PhonemeKey } from "./PhonemeKey";

export function PhonemeKeyboard({
  inventory,
  showHint,
  disabled,
  onKeyPress,
}: {
  inventory: Phoneme[];
  showHint: boolean;
  disabled?: boolean;
  onKeyPress: (phoneme: Phoneme) => void;
}) {
  return (
    <div
      role="group"
      aria-label="Phoneme keyboard"
      className="flex flex-wrap gap-2"
    >
      {inventory.map((phoneme) => (
        <PhonemeKey
          key={phoneme.ipa}
          phoneme={phoneme}
          showHint={showHint}
          disabled={disabled}
          onPress={() => onKeyPress(phoneme)}
        />
      ))}
    </div>
  );
}
