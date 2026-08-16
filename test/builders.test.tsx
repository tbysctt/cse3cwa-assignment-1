import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { WordSearchBuilder } from "@/components/word-search/WordSearchBuilder";
import { WordleBuilder } from "@/components/wordle/WordleBuilder";
import { downloadTextFile } from "@/lib/download";

vi.mock("@/lib/download", () => ({
  downloadTextFile: vi.fn(),
}));

describe("activity builders", () => {
  beforeEach(() => {
    vi.mocked(downloadTextFile).mockClear();
  });

  it("downloads a valid Wordle and disables generation for a blank answer", async () => {
    const user = userEvent.setup();
    render(<WordleBuilder />);
    const generate = screen.getByRole("button", { name: "Generate HTML" });

    await user.click(generate);
    expect(downloadTextFile).toHaveBeenCalledWith(
      "phoneme-wordle.html",
      expect.stringContaining("<!DOCTYPE html>"),
    );

    const english = screen.getByRole("textbox", { name: "English Word" });
    await user.clear(english);
    expect(generate).toBeDisabled();
    expect(screen.getByText(/add a phoneme target and English answer/i)).toBeInTheDocument();
  });

  it("downloads a valid Word Search and disables generation for incomplete rows", async () => {
    const user = userEvent.setup();
    render(<WordSearchBuilder />);
    const generate = screen.getByRole("button", { name: "Generate HTML" });

    await user.click(generate);
    expect(downloadTextFile).toHaveBeenCalledWith(
      "phoneme-word-search.html",
      expect.stringContaining("<!DOCTYPE html>"),
    );

    const firstWord = screen.getByRole("textbox", {
      name: "Word 1 (English)",
    });
    await user.clear(firstWord);
    expect(generate).toBeDisabled();
    expect(screen.getByText("Configured words: 4/5")).toBeInTheDocument();
  });
});
