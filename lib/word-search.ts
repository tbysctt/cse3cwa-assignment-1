import {
  allFillerPhonemes,
  type Phoneme,
  type PhonemeWord,
} from "@/data/phonemes";
import type { Difficulty } from "@/lib/activity";

export type Direction = "H" | "V";

export const DEFAULT_WORD_SEARCH_SEED = 42;
export const REQUIRED_WORD_COUNT = 5;
export const GRID_SIZE_BY_DIFFICULTY: Record<Difficulty, number> = {
  easy: 8,
  medium: 9,
  hard: 10,
};

export class WordSearchGenerationError extends Error {
  constructor(
    public readonly code:
      | "invalid-size"
      | "empty-words"
      | "duplicate-id"
      | "empty-word"
      | "word-too-long"
      | "unplaceable"
      | "invalid-puzzle",
    message: string,
  ) {
    super(message);
    this.name = "WordSearchGenerationError";
  }
}

export type PlacedWord = {
  word: PhonemeWord;
  row: number;
  col: number;
  direction: Direction;
};

export type WordSearchPuzzle = {
  size: number;
  grid: (Phoneme | null)[][];
  placements: PlacedWord[];
};

function emptyGrid(size: number): (Phoneme | null)[][] {
  return Array.from({ length: size }, () =>
    Array.from({ length: size }, () => null),
  );
}

function canPlace(
  grid: (Phoneme | null)[][],
  phonemes: Phoneme[],
  row: number,
  col: number,
  direction: Direction,
): boolean {
  const size = grid.length;
  for (let i = 0; i < phonemes.length; i += 1) {
    const r = direction === "V" ? row + i : row;
    const c = direction === "H" ? col + i : col;
    if (r < 0 || c < 0 || r >= size || c >= size) return false;
    const existing = grid[r][c];
    if (existing && existing.ipa !== phonemes[i].ipa) return false;
  }
  return true;
}

function place(
  grid: (Phoneme | null)[][],
  phonemes: Phoneme[],
  row: number,
  col: number,
  direction: Direction,
) {
  for (let i = 0; i < phonemes.length; i += 1) {
    const r = direction === "V" ? row + i : row;
    const c = direction === "H" ? col + i : col;
    grid[r][c] = phonemes[i];
  }
}

function validateInput(words: PhonemeWord[], size: number) {
  if (!Number.isInteger(size) || size < 1) {
    throw new WordSearchGenerationError(
      "invalid-size",
      "Grid size must be a positive integer.",
    );
  }
  if (words.length === 0) {
    throw new WordSearchGenerationError(
      "empty-words",
      "Add at least one word before generating a puzzle.",
    );
  }
  const ids = new Set<string>();
  for (const word of words) {
    if (ids.has(word.id)) {
      throw new WordSearchGenerationError(
        "duplicate-id",
        `Word IDs must be unique: ${word.id}`,
      );
    }
    ids.add(word.id);
    if (word.phonemes.length === 0 || word.english.trim().length === 0) {
      throw new WordSearchGenerationError(
        "empty-word",
        "Every word needs an English label and at least one phoneme.",
      );
    }
    if (word.phonemes.length > size) {
      throw new WordSearchGenerationError(
        "word-too-long",
        `“${word.english}” is longer than the ${size}×${size} grid.`,
      );
    }
  }
}

/** Deterministic PRNG so the preview and downloaded HTML produce the same grid. */
function mulberry32(seed: number) {
  return function next() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function generateWordSearch(
  words: PhonemeWord[],
  size = 8,
  seed = DEFAULT_WORD_SEARCH_SEED,
): WordSearchPuzzle {
  validateInput(words, size);
  const random = mulberry32(seed);
  const grid = emptyGrid(size);
  const placements: PlacedWord[] = [];
  const ordered = [...words].sort(
    (a, b) => b.phonemes.length - a.phonemes.length,
  );

  for (const word of ordered) {
    const candidates: Array<{
      row: number;
      col: number;
      direction: Direction;
    }> = [];
    for (const direction of ["H", "V"] as const) {
      for (let row = 0; row < size; row += 1) {
        for (let col = 0; col < size; col += 1) {
          if (canPlace(grid, word.phonemes, row, col, direction)) {
            candidates.push({ row, col, direction });
          }
        }
      }
    }
    if (candidates.length === 0) {
      throw new WordSearchGenerationError(
        "unplaceable",
        `Could not place “${word.english}” in the current grid.`,
      );
    }
    const chosen = candidates[Math.floor(random() * candidates.length)];
    place(grid, word.phonemes, chosen.row, chosen.col, chosen.direction);
    placements.push({ word, ...chosen });
  }

  const fillers = allFillerPhonemes();
  for (let r = 0; r < size; r += 1) {
    for (let c = 0; c < size; c += 1) {
      if (!grid[r][c]) {
        grid[r][c] = fillers[Math.floor(random() * fillers.length)];
      }
    }
  }

  return { size, grid, placements };
}

export function cellsForPlacement(placement: PlacedWord): string[] {
  const keys: string[] = [];
  for (let i = 0; i < placement.word.phonemes.length; i += 1) {
    const r = placement.direction === "V" ? placement.row + i : placement.row;
    const c = placement.direction === "H" ? placement.col + i : placement.col;
    keys.push(`${r}-${c}`);
  }
  return keys;
}

export function validateWordSearchPuzzle(
  puzzle: WordSearchPuzzle,
  words: PhonemeWord[],
): void {
  validateInput(words, puzzle.size);
  if (
    puzzle.grid.length !== puzzle.size ||
    puzzle.grid.some(
      (row) => row.length !== puzzle.size || row.some((cell) => cell === null),
    )
  ) {
    throw new WordSearchGenerationError(
      "invalid-puzzle",
      "Puzzle grid dimensions or cells are invalid.",
    );
  }
  for (const word of words) {
    const matches = puzzle.placements.filter(
      (placement) => placement.word.id === word.id,
    );
    if (matches.length !== 1) {
      throw new WordSearchGenerationError(
        "invalid-puzzle",
        `Puzzle must contain exactly one placement for “${word.english}”.`,
      );
    }
    const placement = matches[0];
    const cells = cellsForPlacement(placement);
    const valid = cells.every((key, index) => {
      const [row, col] = key.split("-").map(Number);
      return (
        row >= 0 &&
        col >= 0 &&
        row < puzzle.size &&
        col < puzzle.size &&
        puzzle.grid[row][col]?.ipa === word.phonemes[index].ipa
      );
    });
    if (!valid) {
      throw new WordSearchGenerationError(
        "invalid-puzzle",
        `Placement for “${word.english}” does not match the grid.`,
      );
    }
  }
}

export function matchSelection(
  selectedKeys: string[],
  placements: PlacedWord[],
): PlacedWord | null {
  if (!isStraightContiguousSelection(selectedKeys)) return null;
  for (const placement of placements) {
    const cells = cellsForPlacement(placement);
    const forward = cells.every((key, index) => selectedKeys[index] === key);
    const reverse = cells.every(
      (key, index) => selectedKeys[cells.length - index - 1] === key,
    );
    if (cells.length === selectedKeys.length && (forward || reverse)) {
      return placement;
    }
  }
  return null;
}

export function isStraightContiguousSelection(keys: string[]): boolean {
  if (keys.length === 0 || new Set(keys).size !== keys.length) return false;
  const coordinates = keys.map((key) => {
    const match = /^(\d+)-(\d+)$/.exec(key);
    return match ? [Number(match[1]), Number(match[2])] as const : null;
  });
  if (coordinates.some((coordinate) => coordinate === null)) return false;

  const points = coordinates as ReadonlyArray<readonly [number, number]>;
  if (points.length === 1) return true;
  const rowStep = points[1][0] - points[0][0];
  const colStep = points[1][1] - points[0][1];
  const isUnitStep =
    (Math.abs(rowStep) === 1 && colStep === 0) ||
    (Math.abs(colStep) === 1 && rowStep === 0);
  if (!isUnitStep) return false;
  return points.every(
    ([row, col], index) =>
      row === points[0][0] + rowStep * index &&
      col === points[0][1] + colStep * index,
  );
}
