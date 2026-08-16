import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
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
  INVALID_SELECTION_FLASH_MS,
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
    const { unmount } = render(
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
  function gridButton(container: HTMLElement, key: string) {
    return container.querySelector(`[data-key="${key}"]`) as HTMLButtonElement;
  }

  function dragKeys(container: HTMLElement, keys: string[]) {
    fireEvent.pointerDown(gridButton(container, keys[0]), { button: 0 });
    for (const key of keys.slice(1)) {
      fireEvent.pointerEnter(gridButton(container, key));
    }
    fireEvent.pointerUp(document);
  }

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
    const keys = cellsForPlacement(placement);

    dragKeys(container, keys);

    expect(screen.getByRole("status")).toHaveTextContent(
      new RegExp(placement.word.english, "i"),
    );
    expect(screen.queryByText(placement.word.phonemes[0].grapheme)).not.toBeInTheDocument();
    for (const key of keys) {
      expect(gridButton(container, key).getAttribute("aria-pressed")).toBe("false");
    }

    await user.click(screen.getByRole("button", { name: "Reset activity" }));
    expect(screen.getByRole("status")).toBeEmptyDOMElement();
    const list = screen.getByRole("list");
    expect(within(list).queryByText(/English:/)).not.toBeInTheDocument();
  });

  it("matches reverse and diagonal drag selections", () => {
    const puzzle = generateWordSearch(WORD_SEARCH_WORDS, 9, 42);
    const { container, unmount } = render(
      <WordSearchGame
        puzzle={puzzle}
        words={WORD_SEARCH_WORDS}
        showHints={false}
      />,
    );
    const placement = puzzle.placements[0];
    dragKeys(container, [...cellsForPlacement(placement)].reverse());
    expect(screen.getByRole("status")).toHaveTextContent(
      new RegExp(placement.word.english, "i"),
    );
    unmount();

    let diagonalPuzzle = puzzle;
    let diagonal = puzzle.placements.find(
      (entry) => entry.direction === "DR" || entry.direction === "DL",
    );
    for (let seed = 0; seed < 80 && !diagonal; seed += 1) {
      diagonalPuzzle = generateWordSearch(WORD_SEARCH_WORDS, 9, seed);
      diagonal = diagonalPuzzle.placements.find(
        (entry) => entry.direction === "DR" || entry.direction === "DL",
      );
    }
    expect(diagonal).toBeTruthy();
    const { container: diagonalContainer } = render(
      <WordSearchGame
        puzzle={diagonalPuzzle}
        words={WORD_SEARCH_WORDS}
        showHints={false}
      />,
    );
    dragKeys(diagonalContainer, cellsForPlacement(diagonal!));
    expect(screen.getByRole("status")).toHaveTextContent(
      new RegExp(diagonal!.word.english, "i"),
    );
  });

  it("ignores off-axis drag cells and flashes then clears non-matching lines", async () => {
    const puzzle = generateWordSearch(WORD_SEARCH_WORDS, 9, 42);
    const { container } = render(
      <WordSearchGame
        puzzle={puzzle}
        words={WORD_SEARCH_WORDS}
        showHints={false}
      />,
    );

    // 2-1 is not on a horizontal, vertical, or 45° line from 0-0.
    const start = "0-0";
    const mid = "0-1";
    const offAxis = "2-1";
    fireEvent.pointerDown(gridButton(container, start), { button: 0 });
    fireEvent.pointerEnter(gridButton(container, mid));
    fireEvent.pointerEnter(gridButton(container, offAxis));
    expect(gridButton(container, start).getAttribute("aria-pressed")).toBe("true");
    expect(gridButton(container, mid).getAttribute("aria-pressed")).toBe("true");
    expect(gridButton(container, offAxis).getAttribute("aria-pressed")).toBe(
      "false",
    );

    fireEvent.pointerUp(document);
    expect(gridButton(container, start).getAttribute("data-invalid")).toBe("true");
    expect(gridButton(container, mid).getAttribute("data-invalid")).toBe("true");
    expect(screen.getByRole("status")).toBeEmptyDOMElement();

    await waitFor(
      () => {
        expect(gridButton(container, start).getAttribute("aria-pressed")).toBe(
          "false",
        );
        expect(gridButton(container, mid).getAttribute("aria-pressed")).toBe(
          "false",
        );
        expect(gridButton(container, start).getAttribute("data-invalid")).toBeNull();
      },
      { timeout: INVALID_SELECTION_FLASH_MS + 200 },
    );
  });

  it("treats pointercancel like pointerup for invalid selections", async () => {
    const puzzle = generateWordSearch(WORD_SEARCH_WORDS, 9, 42);
    const { container } = render(
      <WordSearchGame
        puzzle={puzzle}
        words={WORD_SEARCH_WORDS}
        showHints={false}
      />,
    );
    fireEvent.pointerDown(gridButton(container, "0-0"), { button: 0 });
    fireEvent.pointerEnter(gridButton(container, "0-1"));
    fireEvent.pointerCancel(document);
    expect(gridButton(container, "0-0").getAttribute("data-invalid")).toBe("true");
    await waitFor(
      () => {
        expect(gridButton(container, "0-0").getAttribute("aria-pressed")).toBe(
          "false",
        );
      },
      { timeout: INVALID_SELECTION_FLASH_MS + 200 },
    );
  });

  it("rejects off-axis click extensions and clears after the flash", async () => {
    const puzzle = generateWordSearch(WORD_SEARCH_WORDS, 9, 42);
    const { container } = render(
      <WordSearchGame
        puzzle={puzzle}
        words={WORD_SEARCH_WORDS}
        showHints={false}
      />,
    );

    const first = gridButton(container, "0-0");
    const offAxis = gridButton(container, "1-2");
    fireEvent.click(first);
    fireEvent.click(offAxis);
    expect(first.getAttribute("data-invalid")).toBe("true");
    await waitFor(
      () => {
        expect(first.getAttribute("aria-pressed")).toBe("false");
      },
      { timeout: INVALID_SELECTION_FLASH_MS + 200 },
    );
    expect(screen.getByRole("status")).toBeEmptyDOMElement();
  });
});
