import { JSDOM } from "jsdom";
import { describe, expect, it } from "vitest";
import { HCE_WORDS_4, HCE_WORDS_5 } from "@/data/hce-corpus";
import {
  HCE_KEYBOARD_ROWS,
  HCE_PHONEME_INVENTORY,
} from "@/data/hce-keyboard";
import {
  PHONEME_INVENTORY,
  WORDLE_TARGET,
  WORD_SEARCH_WORDS,
} from "@/data/phonemes";
import { generateWordSearchHtml } from "@/lib/generate-word-search-html";
import { generateWordleHtml } from "@/lib/generate-wordle-html";
import { escapeHtml, toJson } from "@/lib/html";
import { cellsForPlacement, generateWordSearch } from "@/lib/word-search";

describe("HTML utilities", () => {
  it("escapes markup-sensitive text", () => {
    expect(escapeHtml('&<>"')).toBe("&amp;&lt;&gt;&quot;");
  });

  it("serializes data without ending a script block", () => {
    const serialized = toJson({ value: "</script>\u2028\u2029" });
    expect(serialized).not.toContain("</script>");
    expect(serialized).toContain("\\u003c/script>");
    expect(serialized).toContain("\\u2028");
    expect(serialized).toContain("\\u2029");
  });
});

describe("standalone activity generators", () => {
  it("validates Wordle settings", () => {
    expect(() =>
      generateWordleHtml({
        target: { ...WORDLE_TARGET, phonemes: [] },
        inventory: PHONEME_INVENTORY,
        maxAttempts: 6,
        difficulty: "medium",
        showHints: true,
      }),
    ).toThrow(/phoneme target/i);

    expect(() =>
      generateWordleHtml({
        target: WORDLE_TARGET,
        inventory: PHONEME_INVENTORY,
        maxAttempts: Number.POSITIVE_INFINITY,
        difficulty: "medium",
        showHints: true,
      }),
    ).toThrow(/attempts/i);
  });

  it("renders untrusted Wordle phoneme metadata as text", () => {
    const hostile = {
      ipa: "<img src=x>",
      grapheme: "<svg/onload=alert(1)>",
      example: "</script><script>alert(1)</script>",
    };
    const html = generateWordleHtml({
      target: { id: "hostile", english: "<b>answer</b>", phonemes: [hostile] },
      inventory: [hostile],
      maxAttempts: 1,
      difficulty: "hard",
      showHints: true,
    });
    const dom = new JSDOM(html, { runScripts: "dangerously" });

    expect(dom.window.document.querySelectorAll("script")).toHaveLength(1);
    expect(dom.window.document.querySelector("img")).toBeNull();
    expect(dom.window.document.querySelector("svg")).toBeNull();
    expect(dom.window.document.querySelector(".key")?.textContent).toContain(
      hostile.ipa,
    );
  });

  it("uses the difficulty grid size and renders English labels safely", () => {
    const words = WORD_SEARCH_WORDS.map((word, index) =>
      index === 0
        ? { ...word, english: '<img src=x onerror="alert(1)">' }
        : word,
    );
    const html = generateWordSearchHtml({
      words,
      difficulty: "hard",
      showHints: false,
      seed: 42,
    });
    const dom = new JSDOM(html, { runScripts: "dangerously" });

    expect(dom.window.document.querySelectorAll(".cell")).toHaveLength(100);
    expect(dom.window.document.querySelector("img")).toBeNull();
    expect(dom.window.document.querySelector(".list")?.textContent).toContain(
      words[0].english,
    );
    expect(dom.window.document.querySelector(".cell .g")).toBeNull();
    expect(dom.window.document.getElementById("reset")).not.toBeNull();
  });

  it("keeps standalone Wordle scoring playable with the HCE keyboard layout", () => {
    const html = generateWordleHtml({
      target: WORDLE_TARGET,
      inventory: HCE_PHONEME_INVENTORY,
      maxAttempts: 2,
      difficulty: "medium",
      showHints: false,
    });
    const dom = new JSDOM(html, { runScripts: "dangerously" });
    expect(dom.window.document.querySelectorAll(".key-row")).toHaveLength(
      HCE_KEYBOARD_ROWS.length,
    );
    expect(
      dom.window.document.getElementById("board")?.getAttribute("role"),
    ).toBe("grid");
    const buttons = [...dom.window.document.querySelectorAll(".key")];
    for (const targetPhoneme of WORDLE_TARGET.phonemes) {
      const button = buttons.find(
        (candidate) =>
          candidate.getAttribute("aria-label") === `/${targetPhoneme.ipa}/`,
      );
      (button as HTMLButtonElement).click();
    }
    (dom.window.document.getElementById("enter") as HTMLButtonElement).click();
    expect(dom.window.document.getElementById("status")).toHaveTextContent(
      /correct/i,
    );
  });

  it("plays four- and five-phoneme standalone Wordle boards", () => {
    const four = HCE_WORDS_4.find((word) => word.id === "stop")!;
    const fourHtml = generateWordleHtml({
      target: four,
      inventory: HCE_PHONEME_INVENTORY,
      maxAttempts: 1,
      difficulty: "hard",
      showHints: false,
    });
    const fourDom = new JSDOM(fourHtml, { runScripts: "dangerously" });
    const fourButtons = [...fourDom.window.document.querySelectorAll(".key")];
    for (const phoneme of four.phonemes) {
      const button = fourButtons.find(
        (candidate) =>
          candidate.getAttribute("aria-label") === `/${phoneme.ipa}/`,
      );
      (button as HTMLButtonElement).click();
    }
    (
      fourDom.window.document.getElementById("enter") as HTMLButtonElement
    ).click();
    expect(fourDom.window.document.getElementById("status")).toHaveTextContent(
      /correct/i,
    );

    const five = HCE_WORDS_5.find((word) => word.id === "street")!;
    const fiveHtml = generateWordleHtml({
      target: five,
      inventory: HCE_PHONEME_INVENTORY,
      maxAttempts: 1,
      difficulty: "hard",
      showHints: false,
    });
    const fiveDom = new JSDOM(fiveHtml, { runScripts: "dangerously" });
    const fiveButtons = [...fiveDom.window.document.querySelectorAll(".key")];
    for (const phoneme of five.phonemes) {
      const button = fiveButtons.find(
        (candidate) =>
          candidate.getAttribute("aria-label") === `/${phoneme.ipa}/`,
      );
      (button as HTMLButtonElement).click();
    }
    (
      fiveDom.window.document.getElementById("enter") as HTMLButtonElement
    ).click();
    expect(fiveDom.window.document.getElementById("status")).toHaveTextContent(
      /correct/i,
    );
  });

  it("keeps standalone Word Search matching and reset playable", () => {
    const puzzle = generateWordSearch(WORD_SEARCH_WORDS, 9, 42);
    const html = generateWordSearchHtml({
      words: WORD_SEARCH_WORDS,
      puzzle,
      difficulty: "medium",
      showHints: false,
    });
    const dom = new JSDOM(html, { runScripts: "dangerously" });
    const placement = puzzle.placements[0];
    for (const key of cellsForPlacement(placement)) {
      (
        dom.window.document.querySelector(
          `[data-key="${key}"]`,
        ) as HTMLButtonElement
      ).click();
    }
    expect(dom.window.document.getElementById("status")).toHaveTextContent(
      placement.word.english,
    );
    (dom.window.document.getElementById("reset") as HTMLButtonElement).click();
    expect(dom.window.document.getElementById("status")).toBeEmptyDOMElement();
  });
});
