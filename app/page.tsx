import Link from "next/link";
import { student } from "@/lib/student";

export default function HomePage() {
  return (
    <div className="flex flex-col gap-[var(--section-gap)]">
      <section className="rounded-2xl border border-border bg-surface px-6 py-10 sm:px-10 sm:py-14">
        <p className="text-sm font-semibold uppercase tracking-wide text-accent">
          CSE3CWA Assessment 1
        </p>
        <h1 className="mt-2 max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
          {student.shortTitle}
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-absent sm:text-lg">
          Build phoneme-based literacy activities for Speech Pathology students
          in your classroom. Configure a Wordle or Word Search activity, preview
          exactly what students will see, and download it as a single HTML file
          that opens in any browser — no internet connection needed.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/wordle"
            className="rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-accent-contrast transition-colors hover:bg-accent-hover"
          >
            Create a Wordle activity
          </Link>
          <Link
            href="/word-search"
            className="rounded-md border border-border bg-background px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-surface-muted"
          >
            Create a Word Search activity
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="flex flex-col rounded-xl border border-border bg-surface p-5">
          <h2 className="text-lg font-semibold">Phoneme Wordle</h2>
          <p className="mt-2 flex-1 text-sm leading-relaxed text-absent">
            Students guess a phoneme sequence with colour-and-pattern feedback
            and hover hints that map IPA symbols to English letter patterns.
          </p>
          <Link
            href="/wordle"
            className="mt-4 inline-block text-sm font-semibold text-accent hover:underline"
          >
            Open Wordle builder
          </Link>
        </article>

        <article className="flex flex-col rounded-xl border border-border bg-surface p-5">
          <h2 className="text-lg font-semibold">Phoneme Word Search</h2>
          <p className="mt-2 flex-1 text-sm leading-relaxed text-absent">
            Learners find phoneme-based words in a generated grid — a useful
            supporting phoneme-recognition task for the classroom.
          </p>
          <Link
            href="/word-search"
            className="mt-4 inline-block text-sm font-semibold text-accent hover:underline"
          >
            Open Word Search builder
          </Link>
        </article>
      </section>

      <section className="rounded-xl border border-border bg-surface p-5">
        <h2 className="text-lg font-semibold">How the workflow works</h2>
        <ol className="mt-3 flex flex-col gap-3 sm:flex-row sm:gap-8">
          <li className="flex items-start gap-3">
            <span
              aria-hidden="true"
              className="flex size-6 shrink-0 items-center justify-center rounded-full bg-accent/15 text-sm font-bold text-accent"
            >
              1
            </span>
            <p className="text-sm leading-relaxed text-absent">
              <strong className="text-foreground">Configure</strong> — choose
              the phoneme word, hints and difficulty.
            </p>
          </li>
          <li className="flex items-start gap-3">
            <span
              aria-hidden="true"
              className="flex size-6 shrink-0 items-center justify-center rounded-full bg-accent/15 text-sm font-bold text-accent"
            >
              2
            </span>
            <p className="text-sm leading-relaxed text-absent">
              <strong className="text-foreground">Preview</strong> — play the
              activity exactly as a student would.
            </p>
          </li>
          <li className="flex items-start gap-3">
            <span
              aria-hidden="true"
              className="flex size-6 shrink-0 items-center justify-center rounded-full bg-accent/15 text-sm font-bold text-accent"
            >
              3
            </span>
            <p className="text-sm leading-relaxed text-absent">
              <strong className="text-foreground">Generate</strong> — download a
              standalone HTML file for any browser.
            </p>
          </li>
        </ol>
      </section>
    </div>
  );
}
