import Link from "next/link";
import { student } from "@/lib/student";

export default function HomePage() {
  return (
    <div className="flex flex-col gap-[var(--section-gap)]">
      <section className="relative overflow-hidden rounded-2xl border border-border bg-surface px-6 py-10 sm:px-10 sm:py-14">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(15,118,110,0.16),transparent_45%),linear-gradient(160deg,transparent,rgba(15,118,110,0.06))]"
        />
        <div className="relative max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-accent">
            CSE3CWA Assessment 1
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {student.shortTitle}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-absent sm:text-lg">
            A frontend builder for Speech Pathology teachers and students to
            create phoneme-based classroom activities. Configure a Wordle or Word
            Search activity, preview it in the browser, then download a single
            HTML file that runs offline.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/wordle"
              className="rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-accent-contrast hover:bg-accent-hover"
            >
              Build Wordle
            </Link>
            <Link
              href="/word-search"
              className="rounded-md border border-border bg-background px-5 py-2.5 text-sm font-semibold hover:bg-surface-muted"
            >
              Build Word Search
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-xl border border-border bg-surface p-5">
          <h2 className="text-lg font-semibold">Phoneme Wordle</h2>
          <p className="mt-2 text-sm leading-relaxed text-absent">
            Guess a single phoneme sequence with colour feedback and hover hints
            that map IPA symbols to English letter patterns.
          </p>
          <Link
            href="/wordle"
            className="mt-4 inline-block text-sm font-semibold text-accent hover:underline"
          >
            Open Wordle builder
          </Link>
        </article>
        <article className="rounded-xl border border-border bg-surface p-5">
          <h2 className="text-lg font-semibold">Phoneme Word Search</h2>
          <p className="mt-2 text-sm leading-relaxed text-absent">
            Find five phoneme-based words in a generated grid — useful as a
            supporting literacy or phoneme-recognition task.
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
        <h2 className="text-lg font-semibold">Also explore</h2>
        <ul className="mt-3 flex flex-wrap gap-4 text-sm font-medium">
          <li>
            <Link href="/about" className="text-accent hover:underline">
              About the project
            </Link>
          </li>
          <li>
            <Link href="/settings" className="text-accent hover:underline">
              Theme and layout settings
            </Link>
          </li>
        </ul>
      </section>
    </div>
  );
}
