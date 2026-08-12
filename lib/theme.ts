export const THEME_COOKIE = "theme";
export const DENSITY_COOKIE = "layoutDensity";

export type Theme = "light" | "dark" | "system";
export type LayoutDensity = "comfortable" | "compact";

const THEMES: Theme[] = ["light", "dark", "system"];

export function parseTheme(value: string | undefined): Theme {
  return THEMES.includes(value as Theme) ? (value as Theme) : "system";
}

export function parseDensity(value: string | undefined): LayoutDensity {
  return value === "compact" ? "compact" : "comfortable";
}

export const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;
