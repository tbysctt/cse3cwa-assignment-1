import type { Metadata } from "next";
import { cookies } from "next/headers";
import { ThemeControls } from "@/components/theme/ThemeControls";
import {
  DENSITY_COOKIE,
  THEME_COOKIE,
  parseDensity,
  parseTheme,
} from "@/lib/theme";

export const metadata: Metadata = {
  title: "Settings",
};

export default async function SettingsPage() {
  const cookieStore = await cookies();
  const theme = parseTheme(cookieStore.get(THEME_COOKIE)?.value);
  const density = parseDensity(cookieStore.get(DENSITY_COOKIE)?.value);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="mt-2 text-absent">
          Interface preferences are stored in cookies so they persist between
          visits.
        </p>
      </header>
      <section className="rounded-xl border border-border bg-surface p-5 sm:p-6">
        <ThemeControls theme={theme} density={density} />
      </section>
    </div>
  );
}
