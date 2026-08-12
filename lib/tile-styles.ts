import type { TileStatus } from "@/lib/wordle";

/**
 * Visual styling for Wordle tiles. Colours are supplemented by non-colour cues:
 * correct tiles are filled solid, present tiles use diagonal stripes, and
 * absent tiles are dimmed with a strikethrough.
 */
export function tileStatusClass(status: TileStatus | undefined): string {
  switch (status) {
    case "correct":
      return "border-correct bg-correct text-white dark:text-accent-contrast";
    case "present":
      return "border-present text-white dark:text-accent-contrast [background-image:repeating-linear-gradient(45deg,rgba(255,255,255,0.18)_0_4px,transparent_4px_8px)]";
    case "absent":
      return "border-absent bg-absent/25 text-foreground/60 line-through decoration-absent/70";
    default:
      return "border-border bg-surface text-foreground";
  }
}

export function tileStatusLabel(status: TileStatus | undefined): string | null {
  switch (status) {
    case "correct":
      return "correct position";
    case "present":
      return "present but wrong position";
    case "absent":
      return "not in the word";
    default:
      return null;
  }
}
