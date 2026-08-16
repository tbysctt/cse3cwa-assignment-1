import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { PhonemePicker } from "@/components/phoneme/PhonemePicker";
import { WordSearchGame } from "@/components/word-search/WordSearchGame";
import { WordleConfigForm } from "@/components/wordle/WordleConfigForm";
import { WordleGame } from "@/components/wordle/WordleGame";
import {
  PHONEME_INVENTORY,
  WORDLE_TARGET,
  WORD_SEARCH_WORDS,
} from "@/data/phonemes";
import {
  cellsForPlacement,
  generateWordSearch,
} from "@/lib/word-search";

describe("PhonemePicker", () => {
  it("adds, removes, backspaces, clears, and honours its limit", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { rerender } = render(
      <PhonemePicker
        label="Target"
        phonemes={[]}
        inventory={PHONEME_INVENTORY.slice(0, 2)}
        onChange={onChange}
        max={1}
      />,
    );

    await user.click(screen.getByRole("button", { name: /\/θ\// }));
    expect(onChange).toHaveBeenLastCalledWith([PHONEME_INVENTORY[0]]);

    rerender(
      <PhonemePicker
        label="Target"
        phonemes={[PHONEME_INVENTORY[0]]}
        inventory={PHONEME_INVENTORY.slice(0, 2)}
        onChange={onChange}
        max={1}
      />,
    );
    expect(
      screen.getByRole("group", { name: /add phonemes/i }).querySelectorAll(
        "button:disabled",
      ),
    ).toHaveLength(2);

    await user.click(screen.getByRole("button", { name: "Backspace" }));
    expect(onChange).toHaveBeenLastCalledWith([]);
    await user.click(screen.getByRole("button", { name: /remove \/θ\//i }));
    expect(onChange).toHaveBeenLastCalledWith([]);
    await user.click(screen.getByRole("button", { name: "Clear" }));
    expect(onChange).toHaveBeenLastCalledWith([]);
  });
});

describe("Wordle components", () => {
  it("plays a winning game and locks its controls", async () => {
    const user = userEvent.setup();
    render(
      <WordleGame
        target={WORDLE_TARGET}
        inventory={PHONEME_INVENTORY}
        maxAttempts={2}
        showHints={false}
      />,
    );

    for (const phoneme of WORDLE_TARGET.phonemes) {
      await user.click(
        screen.getByRole("button", { name: `/${phoneme.ipa}/` }),
      );
    }
    await user.click(screen.getByRole("button", { name: "Enter" }));

    expect(screen.getByRole("status")).toHaveTextContent(/correct/i);
    expect(screen.getByRole("button", { name: "Enter" })).toBeDisabled();
    expect(screen.queryByText("TH")).not.toBeInTheDocument();
  });

  it("reports incomplete guesses", async () => {
    const user = userEvent.setup();
    render(
      <WordleGame
        target={WORDLE_TARGET}
        inventory={PHONEME_INVENTORY}
        maxAttempts={2}
        showHints
      />,
    );
    await user.click(screen.getByRole("button", { name: "Enter" }));
    expect(screen.getByRole("status")).toHaveTextContent(/fill every/i);
  });

  it("applies difficulty presets and clamps attempt drafts", async () => {
    const user = userEvent.setup();
    const onDifficultyChange = vi.fn();
    const onMaxAttemptsChange = vi.fn();
    const onShowHintsChange = vi.fn();
    render(
      <WordleConfigForm
        target={WORDLE_TARGET.phonemes}
        onTargetChange={vi.fn()}
        english="thin"
        onEnglishChange={vi.fn()}
        showHints
        onShowHintsChange={onShowHintsChange}
        maxAttempts={6}
        onMaxAttemptsChange={onMaxAttemptsChange}
        difficulty="medium"
        onDifficultyChange={onDifficultyChange}
        inventory={PHONEME_INVENTORY}
        canGenerate
        onGenerate={vi.fn()}
      />,
    );

    await user.selectOptions(
      screen.getByRole("combobox", { name: "Difficulty" }),
      "hard",
    );
    expect(onDifficultyChange).toHaveBeenCalledWith("hard");
    expect(onMaxAttemptsChange).toHaveBeenCalledWith(5);
    expect(onShowHintsChange).toHaveBeenCalledWith(false);

    const attempts = screen.getByRole("spinbutton", {
      name: "Number of guesses",
    });
    await user.clear(attempts);
    await user.type(attempts, "99");
    await user.tab();
    expect(onMaxAttemptsChange).toHaveBeenLastCalledWith(10);
  });
});

describe("WordSearchGame", () => {
  it("finds a word from a straight sequence and can reset", async () => {
    const user = userEvent.setup();
    const puzzle = generateWordSearch(WORD_SEARCH_WORDS, 9, 42);
    const { container } = render(
      <WordSearchGame
        puzzle={puzzle}
        words={WORD_SEARCH_WORDS}
        showHints={false}
      />,
    );
    const placement = puzzle.placements[0];
    const gridButtons = container.querySelectorAll(
      'button[aria-pressed="false"]',
    );

    for (const key of cellsForPlacement(placement)) {
      const [row, col] = key.split("-").map(Number);
      await user.click(gridButtons[row * puzzle.size + col]);
    }

    expect(screen.getByRole("status")).toHaveTextContent(
      new RegExp(placement.word.english, "i"),
    );
    expect(screen.queryByText(placement.word.phonemes[0].grapheme)).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Reset activity" }));
    expect(screen.getByRole("status")).toBeEmptyDOMElement();
    const list = screen.getByRole("list");
    expect(within(list).queryByText(/English:/)).not.toBeInTheDocument();
  });
});
