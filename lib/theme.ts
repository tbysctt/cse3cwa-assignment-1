export const THEME_COOKIE = "theme";

export type Theme = "light" | "dark" | "system";

const THEMES: Theme[] = ["light", "dark", "system"];

export function parseTheme(value: string | undefined): Theme {
  return THEMES.includes(value as Theme) ? (value as Theme) : "system";
}

export const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;
