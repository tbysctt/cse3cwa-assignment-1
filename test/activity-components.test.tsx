import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { PhonemePicker } from "@/components/phoneme/PhonemePicker";
import { WordSearchGame } from "@/components/word-search/WordSearchGame";
import { PhonemeKeyboard } from "@/components/wordle/PhonemeKeyboard";
import { WordleConfigForm } from "@/components/wordle/WordleConfigForm";
import { WordleGame } from "@/components/wordle/WordleGame";
import { HCE_WORDS_4, HCE_WORDS_5, wordsForLength } from "@/data/hce-corpus";
import { HCE_KEYBOARD_ROWS, HCE_PHONEME_INVENTORY } from "@/data/hce-keyboard";
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
    const theta = PHONEME_INVENTORY.find((phoneme) => phoneme.ipa === "θ")!;
    const kit = PHONEME_INVENTORY.find((phoneme) => phoneme.ipa === "ɪ")!;
    const inventory = [theta, kit];
    const { rerender } = render(
      <PhonemePicker
        label="Target"
        phonemes={[]}
        inventory={inventory}
        onChange={onChange}
        max={1}
      />,
    );

    await user.click(screen.getByRole("button", { name: /\/θ\// }));
    expect(onChange).toHaveBeenLastCalledWith([theta]);

    rerender(
      <PhonemePicker
        label="Target"
        phonemes={[theta]}
        inventory={inventory}
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

describe("PhonemeKeyboard", () => {
  it("renders the fixed HCE row order including blank slots", () => {
    render(
      <PhonemeKeyboard
        inventory={HCE_PHONEME_INVENTORY}
        showHint={false}
        onKeyPress={() => undefined}
      />,
    );
    const keyboard = screen.getByRole("group", { name: "Phoneme keyboard" });
    const rows = keyboard.querySelectorAll(":scope > div");
    expect(rows).toHaveLength(12);
    expect(within(rows[0] as HTMLElement).getByRole("button", { name: "/p/" })).toBeInTheDocument();
    expect(within(rows[0] as HTMLElement).getByRole("button", { name: "/t/" })).toBeInTheDocument();
    expect(within(rows[0] as HTMLElement).getByRole("button", { name: "/k/" })).toBeInTheDocument();
    expect(within(rows[1] as HTMLElement).getByRole("button", { name: "/ɡ/" })).toBeInTheDocument();
    expect(within(rows[6] as HTMLElement).getByRole("button", { name: "/tʃ/" })).toBeInTheDocument();
    const blankCount = [...rows].reduce((total, row) => {
      return (
        total +
        [...row.children].filter(
          (child) =>
            child instanceof HTMLElement &&
            child.tagName === "SPAN" &&
            child.getAttribute("aria-hidden") === "true" &&
            child.childElementCount === 0,
        ).length
      );
    }, 0);
    expect(blankCount).toBe(
      HCE_KEYBOARD_ROWS.flat().filter((slot) => slot === null).length,
    );
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

  it("supports four- and five-phoneme targets as one cell per phoneme", async () => {
    const user = userEvent.setup();
    const four = HCE_WORDS_4.find((word) => word.id === "stop")!;
    const { rerender, unmount } = render(
      <WordleGame
        key={four.id}
        target={four}
        inventory={PHONEME_INVENTORY}
        maxAttempts={2}
        showHints={false}
      />,
    );

    expect(screen.getByText("4 phonemes")).toBeInTheDocument();
    for (const phoneme of four.phonemes) {
      await user.click(screen.getByRole("button", { name: `/${phoneme.ipa}/` }));
    }
    await user.click(screen.getByRole("button", { name: "Enter" }));
    expect(screen.getByRole("status")).toHaveTextContent(/stop/i);

    unmount();
    const five = HCE_WORDS_5.find((word) => word.id === "stamp")!;
    render(
      <WordleGame
        key={five.id}
        target={five}
        inventory={PHONEME_INVENTORY}
        maxAttempts={2}
        showHints={false}
      />,
    );
    expect(screen.getByText("5 phonemes")).toBeInTheDocument();
    for (const phoneme of five.phonemes) {
      await user.click(screen.getByRole("button", { name: `/${phoneme.ipa}/` }));
    }
    await user.click(screen.getByRole("button", { name: "Enter" }));
    expect(screen.getByRole("status")).toHaveTextContent(/stamp/i);
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

  it("does not steal Backspace while a config field is focused", async () => {
    const user = userEvent.setup();
    render(
      <div>
        <input aria-label="Teacher note" defaultValue="abc" />
        <WordleGame
          target={WORDLE_TARGET}
          inventory={PHONEME_INVENTORY}
          maxAttempts={2}
          showHints={false}
        />
      </div>,
    );

    const note = screen.getByRole("textbox", { name: "Teacher note" });
    await user.click(note);
    await user.keyboard("{Backspace}");
    expect(note).toHaveValue("ab");
  });

  it("applies difficulty presets and clamps attempt drafts", async () => {
    const user = userEvent.setup();
    const onDifficultyChange = vi.fn();
    const onMaxAttemptsChange = vi.fn();
    const onShowHintsChange = vi.fn();
    const onLengthChange = vi.fn();
    const onWordIdChange = vi.fn();
    render(
      <WordleConfigForm
        length={3}
        onLengthChange={onLengthChange}
        wordId="thin"
        onWordIdChange={onWordIdChange}
        lengthWords={wordsForLength(3)}
        showHints
        onShowHintsChange={onShowHintsChange}
        maxAttempts={6}
        onMaxAttemptsChange={onMaxAttemptsChange}
        difficulty="medium"
        onDifficultyChange={onDifficultyChange}
        canGenerate
        onGenerate={vi.fn()}
      />,
    );

    expect(screen.getByText(/\/θ\/ \/ɪ\/ \/n\//)).toBeInTheDocument();
    await user.selectOptions(
      screen.getByRole("combobox", { name: "Corpus word" }),
      "ship",
    );
    expect(onWordIdChange).toHaveBeenCalledWith("ship");

    await user.selectOptions(
      screen.getByRole("combobox", { name: "Phoneme length" }),
      "4",
    );
    expect(onLengthChange).toHaveBeenCalledWith(4);

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
