import {
    formatIpa,
    hintLabel,
    type Phoneme,
    type PhonemeWord,
} from "@/lib/phonemes";

function escapeHtml(value: string): string {
    return value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;");
}

export function generateWordleHtml(options: {
    target: PhonemeWord;
    inventory: Phoneme[];
    maxAttempts: number;
    title?: string;
}): string {
    const { target, inventory, maxAttempts } = options;
    const title = options.title ?? "Phoneme Wordle";
    const targetJson = JSON.stringify({
        english: target.english,
        phonemes: target.phonemes,
    });
    const inventoryJson = JSON.stringify(inventory);

    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(title)}</title>
<style>
  :root {
    --bg: #f4f7f8; --fg: #1a2b32; --surface: #fff; --border: #c5d2d7;
    --accent: #0f766e; --correct: #15803d; --present: #a16207; --absent: #64748b;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0; font-family: "Noto Sans", system-ui, sans-serif;
    background: var(--bg); color: var(--fg); line-height: 1.5;
  }
  main { max-width: 40rem; margin: 0 auto; padding: 1.5rem 1rem 3rem; }
  h1 { font-size: 1.5rem; margin: 0 0 0.5rem; }
  .meta { color: #64748b; font-size: 0.95rem; margin-bottom: 1.25rem; }
  .board { display: grid; gap: 0.4rem; margin-bottom: 1.25rem; }
  .row { display: grid; grid-template-columns: repeat(${target.phonemes.length}, minmax(2.5rem, 1fr)); gap: 0.4rem; }
  .tile {
    min-height: 3rem; border: 2px solid var(--border); border-radius: 0.4rem;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    font-family: ui-monospace, monospace; background: var(--surface); position: relative;
  }
  .tile .g { font-size: 0.65rem; font-family: system-ui, sans-serif; color: #64748b; margin-top: 0.15rem; }
  .tile.correct { background: var(--correct); color: #fff; border-color: var(--correct); }
  .tile.present { background: var(--present); color: #fff; border-color: var(--present); }
  .tile.absent { background: var(--absent); color: #fff; border-color: var(--absent); }
  .tile.correct .g, .tile.present .g, .tile.absent .g { color: rgba(255,255,255,0.85); }
  .keyboard { display: flex; flex-wrap: wrap; gap: 0.35rem; margin: 1rem 0; }
  button.key {
    min-width: 3rem; min-height: 3rem; border: 1px solid var(--border); border-radius: 0.4rem;
    background: var(--surface); cursor: pointer; font-family: ui-monospace, monospace; position: relative;
  }
  button.key:hover, button.key:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
  button.key .g { display: block; font-size: 0.65rem; font-family: system-ui, sans-serif; color: #64748b; }
  .actions { display: flex; flex-wrap: wrap; gap: 0.5rem; }
  .actions button {
    border: none; border-radius: 0.4rem; padding: 0.65rem 1rem; font-weight: 600; cursor: pointer;
  }
  .enter { background: var(--accent); color: #fff; }
  .delete { background: #e8eef0; color: var(--fg); }
  .status { min-height: 1.5rem; margin-top: 1rem; font-weight: 600; }
  .win { color: var(--correct); }
  .lose { color: #b91c1c; }
  .tip {
    position: absolute; bottom: calc(100% + 0.35rem); left: 50%; transform: translateX(-50%);
    background: var(--fg); color: #fff; font-size: 0.75rem; padding: 0.25rem 0.5rem; border-radius: 0.25rem;
    white-space: nowrap; pointer-events: none; display: none; z-index: 5;
  }
  .tile:hover .tip, .tile:focus-within .tip, button.key:hover .tip, button.key:focus-visible .tip { display: block; }
</style>
</head>
<body>
<main>
  <h1>${escapeHtml(title)}</h1>
  <p class="meta">Guess the phoneme sequence. Hover or focus a tile for English letter hints. Max attempts: ${maxAttempts}.</p>
  <div id="board" class="board" aria-label="Wordle board"></div>
  <div id="keyboard" class="keyboard" aria-label="Phoneme keyboard"></div>
  <div class="actions">
    <button type="button" class="enter" id="enter">Enter</button>
    <button type="button" class="delete" id="delete">Delete</button>
  </div>
  <p id="status" class="status" role="status" aria-live="polite"></p>
</main>
<script>
(function () {
  const target = ${targetJson};
  const inventory = ${inventoryJson};
  const maxAttempts = ${maxAttempts};
  const length = target.phonemes.length;
  let row = 0;
  let col = 0;
  let locked = false;
  const guesses = Array.from({ length: maxAttempts }, () => Array(length).fill(null));
  const results = Array.from({ length: maxAttempts }, () => Array(length).fill(null));
  const board = document.getElementById("board");
  const keyboard = document.getElementById("keyboard");
  const statusEl = document.getElementById("status");

  function hint(p) {
    return "/" + p.ipa + "/ → " + p.grapheme + " (" + p.example + ")";
  }

  function evaluate(guess) {
    const result = Array(length).fill("absent");
    const remaining = target.phonemes.map((p) => p.ipa);
    for (let i = 0; i < length; i++) {
      if (guess[i] && guess[i].ipa === target.phonemes[i].ipa) {
        result[i] = "correct";
        remaining[i] = "";
      }
    }
    for (let i = 0; i < length; i++) {
      if (result[i] === "correct" || !guess[i]) continue;
      const idx = remaining.indexOf(guess[i].ipa);
      if (idx >= 0) {
        result[i] = "present";
        remaining[idx] = "";
      }
    }
    return result;
  }

  function render() {
    board.innerHTML = "";
    for (let r = 0; r < maxAttempts; r++) {
      const rowEl = document.createElement("div");
      rowEl.className = "row";
      for (let c = 0; c < length; c++) {
        const tile = document.createElement("div");
        tile.className = "tile";
        tile.tabIndex = 0;
        const phoneme = guesses[r][c];
        const status = results[r][c];
        if (status) tile.classList.add(status);
        if (phoneme) {
          tile.title = hint(phoneme);
          tile.innerHTML = "<span>/" + phoneme.ipa + "/</span><span class='g'>" + phoneme.grapheme + "</span><span class='tip'>" + phoneme.grapheme + " (" + phoneme.example + ")</span>";
        }
        rowEl.appendChild(tile);
      }
      board.appendChild(rowEl);
    }
  }

  inventory.forEach((p) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "key";
    btn.title = hint(p);
    btn.setAttribute("aria-label", hint(p));
    btn.innerHTML = "<span>/" + p.ipa + "/</span><span class='g'>" + p.grapheme + "</span><span class='tip'>" + p.grapheme + " (" + p.example + ")</span>";
    btn.addEventListener("click", () => {
      if (locked || col >= length) return;
      guesses[row][col] = p;
      col += 1;
      render();
    });
    keyboard.appendChild(btn);
  });

  document.getElementById("delete").addEventListener("click", () => {
    if (locked || col === 0) return;
    col -= 1;
    guesses[row][col] = null;
    render();
  });

  document.getElementById("enter").addEventListener("click", () => {
    if (locked || col < length) {
      statusEl.textContent = col < length ? "Fill every phoneme before submitting." : "";
      return;
    }
    const guess = guesses[row];
    const result = evaluate(guess);
    results[row] = result;
    render();
    if (result.every((s) => s === "correct")) {
      locked = true;
      statusEl.className = "status win";
      statusEl.textContent = "Correct! English spelling: " + target.english;
      return;
    }
    if (row === maxAttempts - 1) {
      locked = true;
      statusEl.className = "status lose";
      statusEl.textContent = "Out of attempts. Answer: " + target.phonemes.map((p) => "/" + p.ipa + "/").join(" ") + " (" + target.english + ")";
      return;
    }
    row += 1;
    col = 0;
    statusEl.textContent = "";
  });

  render();
})();
</script>
</body>
</html>`;
}

export function inventoryForWordle(extra: Phoneme[] = []): Phoneme[] {
    const map = new Map<string, Phoneme>();
    for (const p of extra) map.set(p.ipa, p);
    return [...map.values()];
}

export { formatIpa, hintLabel };
