import type { TileStatus } from "@/lib/wordle";

export function tileStatusClass(status: TileStatus | undefined): string {
    switch (status) {
        case "correct":
            return "border-correct bg-correct text-white dark:text-accent-contrast";
        case "present":
            return "border-present bg-present text-white dark:text-accent-contrast";
        case "absent":
            return "border-absent bg-absent text-white dark:text-accent-contrast";
        default:
            return "border-border bg-surface text-foreground";
    }
}
