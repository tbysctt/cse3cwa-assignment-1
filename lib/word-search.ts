import {
  allFillerPhonemes,
  type Phoneme,
  type PhonemeWord,
} from "@/data/phonemes";

export type Direction = "H" | "V";

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
  seed = 42,
): WordSearchPuzzle {
  const random = mulberry32(seed);
  const grid = emptyGrid(size);
  const placements: PlacedWord[] = [];
  const ordered = [...words].sort(
    (a, b) => b.phonemes.length - a.phonemes.length,
  );

  for (const word of ordered) {
    let placed = false;
    for (let attempt = 0; attempt < 80 && !placed; attempt += 1) {
      const direction: Direction = random() < 0.5 ? "H" : "V";
      const maxRow =
        direction === "V" ? size - word.phonemes.length : size - 1;
      const maxCol =
        direction === "H" ? size - word.phonemes.length : size - 1;
      if (maxRow < 0 || maxCol < 0) break;
      const row = Math.floor(random() * (maxRow + 1));
      const col = Math.floor(random() * (maxCol + 1));
      if (canPlace(grid, word.phonemes, row, col, direction)) {
        place(grid, word.phonemes, row, col, direction);
        placements.push({ word, row, col, direction });
        placed = true;
      }
    }
    if (!placed) {
      throw new Error(`Could not place word: ${word.english}`);
    }
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

export function matchSelection(
  selectedKeys: string[],
  placements: PlacedWord[],
): PlacedWord | null {
  const selected = new Set(selectedKeys);
  for (const placement of placements) {
    const cells = cellsForPlacement(placement);
    if (
      cells.length === selected.size &&
      cells.every((key) => selected.has(key))
    ) {
      return placement;
    }
  }
  return null;
}
