export const THEME_COOKIE = "theme";
export const DENSITY_COOKIE = "layoutDensity";

export type Theme = "light" | "dark";
export type LayoutDensity = "comfortable" | "compact";

export function parseTheme(value: string | undefined): Theme {
    return value === "dark" ? "dark" : "light";
}

export function parseDensity(value: string | undefined): LayoutDensity {
    return value === "compact" ? "compact" : "comfortable";
}

export const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;
