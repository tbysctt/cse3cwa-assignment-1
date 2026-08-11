import type { Metadata } from "next";
import { student } from "@/lib/student";

export const metadata: Metadata = {
  title: "About",
};

export default function AboutPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-[var(--section-gap)]">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">About</h1>
        <p className="mt-2 text-absent">
          {student.name} · Student number {student.studentNumber}
        </p>
      </header>

      <section className="space-y-3 rounded-xl border border-border bg-surface p-5">
        <h2 className="text-xl font-semibold">What this project is</h2>
        <p className="leading-relaxed text-foreground/90">
          The Phoneme Activity Builder helps Speech Pathology teachers prepare
          classroom activities that emphasise phoneme awareness rather than plain
          spelling drills. Teachers configure an activity in this web app, preview
          how it plays, and download a single HTML file for use in any normal
          browser — including offline classroom machines.
        </p>
        <p className="leading-relaxed text-foreground/90">
          <strong>Assessment 1 is frontend only.</strong> There is no database,
          authentication, or dynamic word-list management yet. Those features are
          planned for later assessments so the builder can rotate through multiple
          phoneme words and richer generation options.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <article className="rounded-xl border border-border bg-surface p-5">
          <h2 className="text-lg font-semibold">Wordle tool</h2>
          <p className="mt-2 text-sm leading-relaxed text-absent">
            Builds a phoneme-based Wordle activity from a single fixed target
            word. Players guess IPA sequences; hover hints show grapheme
            equivalences such as /θ/ → TH (as in thin).
          </p>
        </article>
        <article className="rounded-xl border border-border bg-surface p-5">
          <h2 className="text-lg font-semibold">Word Search tool</h2>
          <p className="mt-2 text-sm leading-relaxed text-absent">
            Generates a word search from a small fixed list of about five
            phoneme-based words. Learners select matching sequences in the grid
            and reveal English spellings when found.
          </p>
        </article>
      </section>

      <section className="rounded-xl border border-border bg-surface p-5">
        <h2 className="text-xl font-semibold">How to use this website</h2>
        <p className="mt-2 text-sm text-absent">
          Replace the placeholder below with your walkthrough video before
          submission (YouTube/Vimeo embed URL or a file at{" "}
          <code className="rounded bg-surface-muted px-1">/howto.mp4</code>).
        </p>
        <div className="mt-4 aspect-video overflow-hidden rounded-lg border border-border bg-surface-muted">
          {/* Drop a local video at public/howto.mp4, or replace with an iframe embed. */}
          <video
            className="h-full w-full"
            controls
            preload="metadata"
            aria-label="How to use the Phoneme Activity Builder"
          >
            <source src="/howto.mp4" type="video/mp4" />
            Your browser does not support the video tag. Add{" "}
            <code>public/howto.mp4</code> or embed an external video here.
          </video>
        </div>
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-relaxed">
          <li>Open Wordle or Word Search from the navigation bar.</li>
          <li>Adjust settings (for Wordle: max attempts) and try the live preview.</li>
          <li>
            Use phoneme hover/focus hints to confirm IPA ↔ English letter mappings.
          </li>
          <li>
            Click <strong>Generate HTML</strong> to download a playable classroom
            file.
          </li>
          <li>Change light/dark theme or layout density under Settings.</li>
        </ol>
      </section>
    </div>
  );
}
