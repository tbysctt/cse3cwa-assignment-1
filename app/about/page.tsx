import { student } from "@/lib/student";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
};

export default function AboutPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-(--section-gap)">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">About</h1>
        <p className="mt-2 text-absent">
          The CSE3CWA assignment by {student.name} ({student.studentNumber})
        </p>
      </header>

      <section className="ui-surface space-y-4 p-5">
        <h2 className="text-xl font-semibold">What this project is</h2>
        <p className="leading-relaxed text-foreground/90">
          The Phoneme Activity Builder helps teachers and Speech Pathology
          students prepare classroom activities that emphasise phoneme awareness
          rather than plain spelling drills. Teachers configure an activity in
          this web app, preview how it plays, and download a single HTML file
          for use in any normal browser — including offline classroom machines.
        </p>
        <p className="leading-relaxed text-foreground/90">
          <strong>Assessment 1 is frontend only.</strong> There is no database,
          authentication, or dynamic word-list management. Those features are
          planned for later assessments so the builder can rotate through many
          phoneme words with richer generation options.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <article className="ui-surface p-5">
          <h2 className="text-lg font-semibold">Phoneme Wordle tool</h2>
          <p className="mt-2 text-sm leading-relaxed text-absent">
            Builds a Wordle-style activity from a phoneme word and its English
            equivalent. Players guess IPA sequences; feedback uses colour and
            pattern, and hover hints map symbols such as /θ/ to letter patterns
            like TH (as in thin).
          </p>
        </article>
        <article className="ui-surface p-5">
          <h2 className="text-lg font-semibold">Phoneme Word Search tool</h2>
          <p className="mt-2 text-sm leading-relaxed text-absent">
            Generates a word search from a small editable list of phoneme-based
            words. Learners select matching sequences in the grid and reveal the
            English spelling of each word once found.
          </p>
        </article>
      </section>

      <section className="ui-surface p-5">
        <h2 className="text-xl font-semibold">Guide</h2>
        <p className="mt-2 text-sm text-absent">
          A walkthrough of the builder. Add{" "}
          <code className="rounded bg-surface-muted px-1">
            public/guide.mp4
          </code>{" "}
          or replace this element with a video embed.
        </p>
        <div className="mt-4 aspect-video overflow-hidden rounded-(--control-radius) border border-border bg-surface-muted">
          <video
            className="h-full w-full"
            controls
            preload="metadata"
            aria-label="How to use the Phoneme Activity Builder"
          >
            <source src="/guide.mp4" type="video/mp4" />
            Your browser does not support the video tag. Add{" "}
            <code>public/guide.mp4</code> or embed an external video here.
          </video>
        </div>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed">
          <li>Open Wordle or Word Search from the navigation bar.</li>
          <li>
            Configure the phoneme word(s), English answers, hints, difficulty
            and guess count.
          </li>
          <li>Try the live preview exactly as a student would play it.</li>
          <li>
            Click <strong>Generate HTML</strong> to download a playable
            classroom file.
          </li>
          <li>Change the light/dark theme or layout density under Settings.</li>
        </ol>
      </section>
    </div>
  );
}
