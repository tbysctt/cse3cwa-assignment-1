import type { PhonemeWord } from "@/data/phonemes";
import type { Difficulty } from "@/lib/activity";
import { escapeHtml, toJson } from "@/lib/html";
import {
  cellsForPlacement,
  DEFAULT_WORD_SEARCH_SEED,
  generateWordSearch,
  GRID_SIZE_BY_DIFFICULTY,
  validateWordSearchPuzzle,
  type WordSearchPuzzle,
} from "@/lib/word-search";

export type WordSearchActivitySettings = {
  words: PhonemeWord[];
  difficulty: Difficulty;
  showHints: boolean;
  puzzle?: WordSearchPuzzle;
  seed?: number;
};

export function generateWordSearchHtml(
  options: WordSearchActivitySettings,
): string {
  const { words, difficulty, showHints } = options;
  const puzzle =
    options.puzzle ??
    generateWordSearch(
      words,
      GRID_SIZE_BY_DIFFICULTY[difficulty],
      options.seed ?? DEFAULT_WORD_SEARCH_SEED,
    );
  validateWordSearchPuzzle(puzzle, words);
  const title = "PHONEME WORD SEARCH";

  const wordsJson = toJson(
    words.map((word) => {
      const placement = puzzle.placements.find((p) => p.word.id === word.id);
      return {
        id: word.id,
        english: word.english,
        display: word.phonemes.map((p) => `/${p.ipa}/`).join(" "),
        hint: word.phonemes
          .map((p) => `/${p.ipa}/ → ${p.grapheme} (${p.example})`)
          .join("; "),
        cells: placement ? cellsForPlacement(placement) : [],
      };
    }),
  );

  const gridJson = toJson(
    puzzle.grid.map((row) =>
      row.map((cell) => ({
        ipa: cell!.ipa,
        grapheme: cell!.grapheme,
        example: cell!.example,
      })),
    ),
  );

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(title)}</title>
<style>
  :root {
    --bg: #f4f7f8; --fg: #1a2b32; --surface: #fff; --border: #c5d2d7;
    --accent: #0f766e; --correct: #15803d; --selected: #99f6e4;
  }
  * { box-sizing: border-box; }
  body { margin: 0; font-family: "Noto Sans", system-ui, sans-serif; background: var(--bg); color: var(--fg); }
  main { max-width: 54rem; margin: 0 auto; padding: 1.5rem 1rem 3rem; }
  h1 { font-size: 1.5rem; letter-spacing: 0.04em; margin: 0 0 0.5rem; }
  .meta { color: #64748b; margin-bottom: 1rem; }
  .settings {
    display: inline-flex; flex-wrap: wrap; gap: 0.4rem 0.9rem;
    margin-bottom: 1rem; font-size: 0.85rem; color: #64748b;
  }
  .settings span { background: var(--surface); border: 1px solid var(--border); border-radius: 999px; padding: 0.2rem 0.6rem; }
  .layout { display: grid; gap: 1.5rem; }
  @media (min-width: 768px) { .layout { grid-template-columns: 1fr 15rem; } }
  .grid-wrap { overflow-x: auto; padding-bottom: 0.25rem; }
  .grid {
    display: grid; gap: 0.25rem;
    grid-template-columns: repeat(${puzzle.size}, minmax(2rem, 1fr));
    min-width: ${puzzle.size * 2.4}rem;
    user-select: none;
  }
  .cell {
    min-height: 2.75rem; border: 1px solid var(--border); border-radius: 0.35rem;
    background: var(--surface); font-family: ui-monospace, monospace; font-size: 0.9rem;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    cursor: pointer; position: relative; touch-action: none;
  }
  .cell .g { font-size: 0.6rem; font-family: system-ui, sans-serif; color: #64748b; }
  .cell.selected {
    background: var(--selected); border-color: var(--accent);
    box-shadow: inset 0 0 0 2px var(--accent);
  }
  .cell.found {
    background: #bbf7d0; border-color: var(--correct); opacity: 0.9;
    box-shadow: inset 0 0 0 2px var(--correct);
  }
  .tip {
    position: absolute; bottom: calc(100% + 0.25rem); left: 50%; transform: translateX(-50%);
    background: var(--fg); color: #fff; font-size: 0.7rem; padding: 0.2rem 0.4rem; border-radius: 0.25rem;
    white-space: nowrap; display: none; pointer-events: none; z-index: 5;
  }
  .cell:hover .tip, .cell:focus-visible .tip { display: block; }
  .list { list-style: none; padding: 0; margin: 0; display: grid; gap: 0.5rem; }
  .list li {
    border: 1px solid var(--border); border-radius: 0.4rem; padding: 0.6rem 0.75rem; background: var(--surface);
  }
  .list li.done { opacity: 0.65; }
  .list .eng { display: none; color: var(--correct); font-weight: 600; font-size: 0.85rem; }
  .list li.done .eng { display: block; }
  .status { margin-top: 1rem; font-weight: 600; min-height: 1.4rem; }
  .actions { margin-top: 0.75rem; }
  .actions button {
    border: none; background: var(--accent); color: #fff; border-radius: 0.4rem;
    padding: 0.55rem 0.9rem; font-weight: 600; cursor: pointer;
  }
</style>
</head>
<body>
<main>
  <h1>${escapeHtml(title)}</h1>
  <p class="meta">Select a straight line of connected phoneme cells (tap or drag) that matches a word in the list. Hover or focus a cell for letter hints.</p>
  <div class="settings" aria-label="Activity settings">
    <span>Difficulty: ${escapeHtml(difficulty)}</span>
    <span>${words.length} words</span>
  </div>
  <div class="layout">
    <div>
      <div class="grid-wrap"><div id="grid" class="grid" aria-label="Phoneme word search grid"></div></div>
      <div class="actions">
        <button type="button" id="clear">Clear selection</button>
        <button type="button" id="reset">Reset activity</button>
      </div>
      <p id="status" class="status" role="status" aria-live="polite"></p>
    </div>
    <div>
      <h2 style="font-size:1rem;margin:0 0 0.5rem;">Find these words</h2>
      <ul id="list" class="list"></ul>
    </div>
  </div>
</main>
<script>
(function () {
  const gridData = ${gridJson};
  const words = ${wordsJson};
  const size = ${puzzle.size};
  const showHints = ${showHints ? "true" : "false"};
  const found = new Set();
  const foundCells = new Set();
  let selecting = false;
  let selected = [];
  let selectionBeforePointer = [];
  let suppressClick = false;
  const gridEl = document.getElementById("grid");
  const listEl = document.getElementById("list");
  const statusEl = document.getElementById("status");

  function key(r, c) { return r + "-" + c; }

  function appendPhonemeContent(container, phoneme, includeHint) {
    const ipa = document.createElement("span");
    ipa.textContent = "/" + phoneme.ipa + "/";
    container.appendChild(ipa);
    if (!includeHint) return;
    const grapheme = document.createElement("span");
    grapheme.className = "g";
    grapheme.textContent = phoneme.grapheme;
    container.appendChild(grapheme);
    const tip = document.createElement("span");
    tip.className = "tip";
    tip.textContent = phoneme.grapheme + " (" + phoneme.example + ")";
    container.appendChild(tip);
  }

  function renderList() {
    listEl.innerHTML = "";
    words.forEach((w) => {
      const li = document.createElement("li");
      if (found.has(w.id)) li.classList.add("done");
      if (showHints) li.title = w.hint;
      const display = document.createElement("div");
      display.textContent = w.display;
      li.appendChild(display);
      const english = document.createElement("div");
      english.className = "eng";
      english.textContent = "English: " + w.english;
      li.appendChild(english);
      listEl.appendChild(li);
    });
  }

  function updateSelectionClasses() {
    gridEl.querySelectorAll(".cell").forEach((el) => {
      const k = el.getAttribute("data-key");
      el.classList.toggle("selected", selected.includes(k));
      el.classList.toggle("found", foundCells.has(k));
    });
  }

  function tryMatch() {
    if (!isStraightContiguous(selected)) return;
    for (const w of words) {
      if (found.has(w.id)) continue;
      const forward = w.cells.every((c, index) => selected[index] === c);
      const reverse = w.cells.every((c, index) => selected[w.cells.length - index - 1] === c);
      if (w.cells.length === selected.length && (forward || reverse)) {
        found.add(w.id);
        w.cells.forEach((c) => foundCells.add(c));
        selected = [];
        statusEl.textContent = "Found \u201c" + w.english + "\u201d!";
        renderList();
        updateSelectionClasses();
        if (found.size === words.length) {
          statusEl.textContent = "Well done \u2014 all phoneme words found!";
        }
        return;
      }
    }
  }

  function isStraightContiguous(keys) {
    if (keys.length === 0 || new Set(keys).size !== keys.length) return false;
    const points = keys.map((value) => {
      const match = /^(\\d+)-(\\d+)$/.exec(value);
      return match ? [Number(match[1]), Number(match[2])] : null;
    });
    if (points.some((point) => point === null)) return false;
    if (points.length === 1) return true;
    const rowStep = points[1][0] - points[0][0];
    const colStep = points[1][1] - points[0][1];
    const unit = (Math.abs(rowStep) === 1 && colStep === 0) ||
      (Math.abs(colStep) === 1 && rowStep === 0);
    return unit && points.every((point, index) =>
      point[0] === points[0][0] + rowStep * index &&
      point[1] === points[0][1] + colStep * index
    );
  }

  function addCell(r, c) {
    const k = key(r, c);
    if (!selected.includes(k)) selected.push(k);
    updateSelectionClasses();
  }

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const cell = gridData[r][c];
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "cell";
      btn.dataset.key = key(r, c);
      const hintText = "/" + cell.ipa + "/ → " + cell.grapheme + " (" + cell.example + ")";
      if (showHints) {
        btn.title = hintText;
        btn.setAttribute("aria-label", hintText);
      } else {
        btn.setAttribute("aria-label", "/" + cell.ipa + "/");
      }
      appendPhonemeContent(btn, cell, showHints);
      btn.addEventListener("pointerdown", (e) => {
        if (e.button !== 0) return;
        e.preventDefault();
        suppressClick = true;
        selecting = true;
        selectionBeforePointer = selected.slice();
        selected = [key(r, c)];
        updateSelectionClasses();
      });
      btn.addEventListener("pointerenter", () => { if (selecting) addCell(r, c); });
      btn.addEventListener("click", () => {
        if (suppressClick) {
          suppressClick = false;
          return;
        }
        if (!selecting) {
          if (selected.includes(key(r, c))) selected = selected.filter((x) => x !== key(r, c));
          else selected.push(key(r, c));
          updateSelectionClasses();
          tryMatch();
        }
      });
      gridEl.appendChild(btn);
    }
  }

  document.addEventListener("pointerup", () => {
    if (!selecting) return;
    selecting = false;
    if (selected.length === 1) {
      const selectedKey = selected[0];
      selected = selectionBeforePointer.includes(selectedKey)
        ? selectionBeforePointer.filter((value) => value !== selectedKey)
        : selectionBeforePointer.concat(selectedKey);
      updateSelectionClasses();
    }
    tryMatch();
  });
  document.getElementById("clear").addEventListener("click", () => {
    selected = [];
    updateSelectionClasses();
    statusEl.textContent = "";
  });
  document.getElementById("reset").addEventListener("click", () => {
    found.clear();
    foundCells.clear();
    selected = [];
    statusEl.textContent = "";
    renderList();
    updateSelectionClasses();
  });

  renderList();
})();
</script>
</body>
</html>`;
}
