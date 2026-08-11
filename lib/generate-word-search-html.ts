import type { PhonemeWord } from "@/lib/phonemes";
import {
    cellsForPlacement,
    generateWordSearch,
    type WordSearchPuzzle,
} from "@/lib/word-search";

function escapeHtml(value: string): string {
    return value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;");
}

export function generateWordSearchHtml(options: {
    words: PhonemeWord[];
    puzzle?: WordSearchPuzzle;
    seed?: number;
    title?: string;
}): string {
    const puzzle =
        options.puzzle ?? generateWordSearch(options.words, 8, options.seed ?? 42);
    const title = options.title ?? "Phoneme Word Search";
    const wordsJson = JSON.stringify(
        options.words.map((word) => ({
            id: word.id,
            english: word.english,
            display: word.phonemes.map((p) => `/${p.ipa}/`).join(" "),
            hint: word.phonemes
                .map((p) => `/${p.ipa}/ → ${p.grapheme} (${p.example})`)
                .join("; "),
            cells: cellsForPlacement(
                puzzle.placements.find((p) => p.word.id === word.id)!,
            ),
        })),
    );
    const gridJson = JSON.stringify(
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
  body { margin: 0; font-family: system-ui, sans-serif; background: var(--bg); color: var(--fg); }
  main { max-width: 52rem; margin: 0 auto; padding: 1.5rem 1rem 3rem; }
  h1 { font-size: 1.5rem; margin: 0 0 0.5rem; }
  .meta { color: #64748b; margin-bottom: 1rem; }
  .layout { display: grid; gap: 1.5rem; }
  @media (min-width: 768px) { .layout { grid-template-columns: 1fr 14rem; } }
  .grid {
    display: grid; gap: 0.25rem;
    grid-template-columns: repeat(${puzzle.size}, minmax(2.25rem, 1fr));
    user-select: none;
  }
  .cell {
    min-height: 2.75rem; border: 1px solid var(--border); border-radius: 0.35rem;
    background: var(--surface); font-family: ui-monospace, monospace; font-size: 0.9rem;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    cursor: pointer; position: relative;
  }
  .cell .g { font-size: 0.6rem; font-family: system-ui, sans-serif; color: #64748b; }
  .cell.selected { background: var(--selected); }
  .cell.found { background: #bbf7d0; border-color: var(--correct); }
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
  .list li.done { opacity: 0.65; text-decoration: line-through; }
  .list .eng { display: none; color: var(--correct); font-weight: 600; font-size: 0.85rem; }
  .list li.done .eng { display: block; text-decoration: none; }
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
  <p class="meta">Select connected phoneme cells (tap or drag) that match a word in the list. Hover for letter hints.</p>
  <div class="layout">
    <div>
      <div id="grid" class="grid" aria-label="Word search grid"></div>
      <div class="actions"><button type="button" id="clear">Clear selection</button></div>
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
  const found = new Set();
  const foundCells = new Set();
  let selecting = false;
  let selected = [];
  const gridEl = document.getElementById("grid");
  const listEl = document.getElementById("list");
  const statusEl = document.getElementById("status");

  function key(r, c) { return r + "-" + c; }

  function renderList() {
    listEl.innerHTML = "";
    words.forEach((w) => {
      const li = document.createElement("li");
      if (found.has(w.id)) li.classList.add("done");
      li.title = w.hint;
      li.innerHTML = "<div>" + w.display + "</div><div class='eng'>English: " + w.english + "</div>";
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
    const set = new Set(selected);
    for (const w of words) {
      if (found.has(w.id)) continue;
      if (w.cells.length === set.size && w.cells.every((c) => set.has(c))) {
        found.add(w.id);
        w.cells.forEach((c) => foundCells.add(c));
        selected = [];
        statusEl.textContent = "Found “" + w.english + "”!";
        renderList();
        updateSelectionClasses();
        if (found.size === words.length) {
          statusEl.textContent = "Well done — all phoneme words found!";
        }
        return;
      }
    }
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
      btn.title = "/" + cell.ipa + "/ → " + cell.grapheme + " (" + cell.example + ")";
      btn.setAttribute("aria-label", btn.title);
      btn.innerHTML = "<span>/" + cell.ipa + "/</span><span class='g'>" + cell.grapheme + "</span><span class='tip'>" + cell.grapheme + " (" + cell.example + ")</span>";
      btn.addEventListener("mousedown", (e) => { e.preventDefault(); selecting = true; selected = [key(r, c)]; updateSelectionClasses(); });
      btn.addEventListener("mouseenter", () => { if (selecting) addCell(r, c); });
      btn.addEventListener("mouseup", () => { selecting = false; tryMatch(); });
      btn.addEventListener("click", () => {
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

  document.addEventListener("mouseup", () => { if (selecting) { selecting = false; tryMatch(); } });
  document.getElementById("clear").addEventListener("click", () => {
    selected = [];
    updateSelectionClasses();
    statusEl.textContent = "";
  });

  renderList();
})();
</script>
</body>
</html>`;
}
