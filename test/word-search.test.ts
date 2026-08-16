import { describe, expect, it } from "vitest";
import {
  PHONEME_INVENTORY,
  WORD_SEARCH_WORDS,
  type PhonemeWord,
} from "@/data/phonemes";
import {
  cellsForPlacement,
  generateWordSearch,
  isStraightContiguousSelection,
  matchSelection,
  validateWordSearchPuzzle,
  WordSearchGenerationError,
} from "@/lib/word-search";

describe("Word Search generation", () => {
  it("is deterministic and produces a complete valid grid", () => {
    const first = generateWordSearch(WORD_SEARCH_WORDS, 9, 42);
    const second = generateWordSearch(WORD_SEARCH_WORDS, 9, 42);

    expect(first).toEqual(second);
    expect(first.placements).toHaveLength(WORD_SEARCH_WORDS.length);
    expect(first.grid).toHaveLength(9);
    expect(first.grid.every((row) => row.length === 9)).toBe(true);
    expect(first.grid.flat().every(Boolean)).toBe(true);
    expect(() =>
      validateWordSearchPuzzle(first, WORD_SEARCH_WORDS),
    ).not.toThrow();
  });

  it("does not mutate the supplied word order", () => {
    const words = [...WORD_SEARCH_WORDS].reverse();
    const ids = words.map((word) => word.id);
    generateWordSearch(words, 9, 1);
    expect(words.map((word) => word.id)).toEqual(ids);
  });

  it.each([
    [[], 8, "empty-words"],
    [WORD_SEARCH_WORDS, 0, "invalid-size"],
  ] as const)("rejects invalid generator input", (words, size, code) => {
    expect(() => generateWordSearch([...words], size)).toThrowError(
      expect.objectContaining({ code }),
    );
  });

  it("rejects duplicate IDs, empty words, and overlong words", () => {
    const duplicate = [
      WORD_SEARCH_WORDS[0],
      { ...WORD_SEARCH_WORDS[1], id: WORD_SEARCH_WORDS[0].id },
    ];
    expect(() => generateWordSearch(duplicate, 8)).toThrowError(
      expect.objectContaining({ code: "duplicate-id" }),
    );

    const empty: PhonemeWord = { id: "empty", english: " ", phonemes: [] };
    expect(() => generateWordSearch([empty], 8)).toThrowError(
      expect.objectContaining({ code: "empty-word" }),
    );

    const long: PhonemeWord = {
      id: "long",
      english: "long",
      phonemes: Array.from({ length: 9 }, () => PHONEME_INVENTORY[0]),
    };
    expect(() => generateWordSearch([long], 8)).toThrowError(
      expect.objectContaining({ code: "word-too-long" }),
    );
  });

  it("rejects malformed supplied puzzles", () => {
    const puzzle = generateWordSearch(WORD_SEARCH_WORDS, 9, 42);
    puzzle.grid[0] = [];
    expect(() => validateWordSearchPuzzle(puzzle, WORD_SEARCH_WORDS)).toThrow(
      WordSearchGenerationError,
    );
  });
});

describe("Word Search selection rules", () => {
  const word = WORD_SEARCH_WORDS[0];
  const horizontal = { word, row: 2, col: 3, direction: "H" as const };
  const vertical = { word, row: 1, col: 4, direction: "V" as const };

  it("lists horizontal and vertical placement cells", () => {
    expect(cellsForPlacement(horizontal)).toEqual(["2-3", "2-4", "2-5"]);
    expect(cellsForPlacement(vertical)).toEqual(["1-4", "2-4", "3-4"]);
  });

  it("matches forward and reverse straight paths", () => {
    const cells = cellsForPlacement(horizontal);
    expect(matchSelection(cells, [horizontal])).toBe(horizontal);
    expect(matchSelection([...cells].reverse(), [horizontal])).toBe(horizontal);
  });

  it.each([
    [["1-1", "1-3"], false],
    [["1-1", "1-2", "2-2"], false],
    [["1-1", "2-2"], false],
    [["1-1", "1-1"], false],
    [["bad"], false],
    [["1-1", "1-2", "1-3"], true],
    [["3-1", "2-1", "1-1"], true],
  ])("validates path %j", (keys, expected) => {
    expect(isStraightContiguousSelection(keys as string[])).toBe(expected);
  });

  it("rejects subsets, extra cells, bent paths, and unordered sets", () => {
    expect(matchSelection(["2-3", "2-4"], [horizontal])).toBeNull();
    expect(
      matchSelection(["2-3", "2-4", "2-5", "2-6"], [horizontal]),
    ).toBeNull();
    expect(matchSelection(["2-3", "2-5", "2-4"], [horizontal])).toBeNull();
  });
});
