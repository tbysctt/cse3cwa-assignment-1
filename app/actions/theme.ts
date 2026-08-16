"use server";

import { COOKIE_MAX_AGE, THEME_COOKIE, type Theme } from "@/lib/theme";
import { cookies } from "next/headers";

export async function setTheme(theme: Theme) {
  const store = await cookies();
  store.set(THEME_COOKIE, theme, {
    path: "/",
    maxAge: COOKIE_MAX_AGE,
    sameSite: "lax",
  });
}
