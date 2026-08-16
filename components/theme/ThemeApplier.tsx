"use client";

import { useTheme } from "@/hooks/useTheme";
import type { Theme } from "@/lib/theme";

/**
 * Mounted once in the root layout. Applies the resolved theme class to the
 * document root and keeps "system" in sync with OS preference changes.
 */
export function ThemeApplier({ theme }: { theme: Theme }) {
  useTheme(theme);
  return null;
}
