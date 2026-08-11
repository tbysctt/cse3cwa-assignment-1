import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Noto_Sans, Noto_Sans_Mono } from "next/font/google";
import { SiteShell } from "@/components/layout/SiteShell";
import { student } from "@/lib/student";
import {
  DENSITY_COOKIE,
  THEME_COOKIE,
  parseDensity,
  parseTheme,
} from "@/lib/theme";
import "./globals.css";

const notoSans = Noto_Sans({
  variable: "--font-noto-sans",
  subsets: ["latin", "latin-ext"],
});

const notoMono = Noto_Sans_Mono({
  variable: "--font-noto-mono",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  title: {
    default: student.shortTitle,
    template: `%s · ${student.shortTitle}`,
  },
  description:
    "Frontend builder for phoneme-based Wordle and Word Search classroom activities for Speech Pathology teaching.",
};

export default async function RootLayout({
  children,
}: LayoutProps<"/">) {
  const cookieStore = await cookies();
  const theme = parseTheme(cookieStore.get(THEME_COOKIE)?.value);
  const density = parseDensity(cookieStore.get(DENSITY_COOKIE)?.value);

  return (
    <html
      lang="en"
      className={`${notoSans.variable} ${notoMono.variable} h-full antialiased ${theme === "dark" ? "dark" : ""}`}
    >
      <body
        className="min-h-full flex flex-col font-sans"
        data-density={density}
        data-theme={theme}
      >
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
