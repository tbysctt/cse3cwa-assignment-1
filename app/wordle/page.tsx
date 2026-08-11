import type { Metadata } from "next";
import { WordleBuilder } from "@/components/wordle/WordleBuilder";

export const metadata: Metadata = {
  title: "Wordle",
};

export default function WordlePage() {
  return (
    <div className="flex flex-col gap-4">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Phoneme Wordle</h1>
        <p className="mt-2 max-w-2xl text-absent">
          Create a Wordle-style classroom activity using phoneme symbols. Preview
          the game below, then generate a single HTML file for offline play.
        </p>
      </header>
      <WordleBuilder />
    </div>
  );
}
