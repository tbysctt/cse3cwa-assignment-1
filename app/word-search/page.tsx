import type { Metadata } from "next";
import { WordSearchBuilder } from "@/components/word-search/WordSearchBuilder";

export const metadata: Metadata = {
  title: "Word Search",
};

export default function WordSearchPage() {
  return (
    <div className="flex flex-col gap-4">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Phoneme Word Search</h1>
        <p className="mt-2 max-w-2xl text-absent">
          Build a phoneme-based word search from a small fixed word list. Preview
          the grid, then download a playable HTML activity for class use.
        </p>
      </header>
      <WordSearchBuilder />
    </div>
  );
}
