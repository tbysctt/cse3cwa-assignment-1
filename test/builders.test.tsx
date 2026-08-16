import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { WordSearchBuilder } from "@/components/word-search/WordSearchBuilder";
import { WordleBuilder } from "@/components/wordle/WordleBuilder";
import { WORD_SEARCH_WORDS } from "@/data/phonemes";
import { downloadTextFile } from "@/lib/download";
import { DIFFICULTY_PRESETS } from "@/lib/wordle";

vi.mock("@/lib/download", () => ({
  downloadTextFile: vi.fn(),
}));

describe("activity builders", () => {
  beforeEach(() => {
    vi.mocked(downloadTextFile).mockClear();
  });

  it("downloads a valid Wordle from the HCE corpus with difficulty presets", async () => {
    const user = userEvent.setup();
    render(<WordleBuilder />);
    const generate = screen.getByRole("button", { name: "Generate HTML" });

    expect(screen.getByRole("combobox", { name: "Phoneme length" })).toHaveValue(
      "3",
    );
    expect(screen.getByRole("combobox", { name: "Corpus word" })).toHaveValue(
      "thin",
    );
    expect(screen.getByText(/\/θ\/ \/ɪ\/ \/n\//)).toBeInTheDocument();
    expect(screen.getByText(/6 guesses, hints on/i)).toBeInTheDocument();
    expect(screen.queryByRole("spinbutton")).not.toBeInTheDocument();

    await user.selectOptions(
      screen.getByRole("combobox", { name: "Phoneme length" }),
      "5",
    );
    expect(screen.getByRole("combobox", { name: "Corpus word" })).toHaveValue(
      "stamp",
    );

    await user.selectOptions(
      screen.getByRole("combobox", { name: "Difficulty" }),
      "hard",
    );
    expect(screen.getByText(/5 guesses, hints off/i)).toBeInTheDocument();

    await user.click(generate);
    expect(downloadTextFile).toHaveBeenCalledWith(
      "phoneme-wordle.html",
      expect.stringContaining("<!DOCTYPE html>"),
    );
    const html = vi.mocked(downloadTextFile).mock.calls[0][1] as string;
    expect(html).toContain("stamp");
    expect(html).toContain("key-row");
    expect(html).toContain(`Guesses: ${DIFFICULTY_PRESETS.hard.maxAttempts}`);
  });

  it("downloads a Word Search from the fixed five-word list", async () => {
    const user = userEvent.setup();
    render(<WordSearchBuilder />);
    const generate = screen.getByRole("button", { name: "Generate HTML" });

    expect(
      screen.getByRole("list", { name: "Fixed word search list" }),
    ).toBeInTheDocument();
    for (const word of WORD_SEARCH_WORDS) {
      expect(screen.getByText(word.english)).toBeInTheDocument();
    }
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    expect(screen.getByText(/9×9 grid, hints on/i)).toBeInTheDocument();

    await user.selectOptions(
      screen.getByRole("combobox", { name: "Difficulty" }),
      "hard",
    );
    expect(screen.getByText(/10×10 grid, hints off/i)).toBeInTheDocument();

    await user.click(generate);
    expect(downloadTextFile).toHaveBeenCalledWith(
      "phoneme-word-search.html",
      expect.stringContaining("<!DOCTYPE html>"),
    );
    expect(generate).toBeEnabled();
  });
});
