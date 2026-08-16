"use server";

import { cookies } from "next/headers";
import { COOKIE_MAX_AGE, THEME_COOKIE, type Theme } from "@/lib/theme";

export async function setTheme(theme: Theme) {
  const store = await cookies();
  store.set(THEME_COOKIE, theme, {
    path: "/",
    maxAge: COOKIE_MAX_AGE,
    sameSite: "lax",
  });
}
