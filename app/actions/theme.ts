"use server";

import { cookies } from "next/headers";
import {
  COOKIE_MAX_AGE,
  DENSITY_COOKIE,
  THEME_COOKIE,
  type LayoutDensity,
  type Theme,
} from "@/lib/theme";

export async function setTheme(theme: Theme) {
  const store = await cookies();
  store.set(THEME_COOKIE, theme, {
    path: "/",
    maxAge: COOKIE_MAX_AGE,
    sameSite: "lax",
  });
}

export async function setLayoutDensity(density: LayoutDensity) {
  const store = await cookies();
  store.set(DENSITY_COOKIE, density, {
    path: "/",
    maxAge: COOKIE_MAX_AGE,
    sameSite: "lax",
  });
}
