import type { Metadata } from "next";
import { cookies } from "next/headers";
import { ThemeControls } from "@/components/settings/ThemeControls";
import { THEME_COOKIE, parseTheme } from "@/lib/theme";

export const metadata: Metadata = {
  title: "Settings",
};

export default async function SettingsPage() {
  const cookieStore = await cookies();
  const theme = parseTheme(cookieStore.get(THEME_COOKIE)?.value);

  return (
    <div className="mx-auto flex flex-col gap-(--section-gap)">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
      </header>
      <section className="ui-surface ui-surface-pad">
        <ThemeControls theme={theme} />
      </section>
    </div>
  );
}
