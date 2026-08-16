"use client";

import type { Theme } from "@/lib/theme";
import { useLayoutEffect } from "react";

function systemPrefersDark(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );
}

/**
 * Resolves the stored theme preference (including "system") and applies the
 * `dark` class to the root element. Explicit light/dark choices are already
 * applied server-side to avoid a flash; this hook handles the "system"
 * resolution and keeps it in sync with OS preference changes.
 */
export function useTheme(theme: Theme) {
  useLayoutEffect(() => {
    applyThemeClass(theme);

    if (theme !== "system") return;

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyThemeClass("system");
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [theme]);
}

function applyThemeClass(theme: Theme) {
  const resolved =
    theme === "system" ? (systemPrefersDark() ? "dark" : "light") : theme;
  document.documentElement.classList.toggle("dark", resolved === "dark");
}
