import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { contrastRatio, isHex } from "./contrast";
import {
  CONTRAST_PAIRS,
  parseColorTokens,
  resolvePalette,
  type Theme,
} from "./tokens";

const css = readFileSync(
  fileURLToPath(new URL("../../app/globals.css", import.meta.url)),
  "utf8",
);
const tokens = parseColorTokens(css);
const themes: Theme[] = ["light", "dark"];

describe("contrastRatio", () => {
  it("matches the WCAG reference values", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 5);
    expect(contrastRatio("#ffffff", "#ffffff")).toBeCloseTo(1, 5);
    expect(contrastRatio("#777777", "#ffffff")).toBeCloseTo(4.48, 2);
  });

  it("is symmetric", () => {
    expect(contrastRatio("#1b2233", "#f6f1e7")).toBe(
      contrastRatio("#f6f1e7", "#1b2233"),
    );
  });

  it("rejects anything but 6-digit hex", () => {
    expect(() => contrastRatio("#fff", "#000000")).toThrow();
    expect(() => contrastRatio("red", "#000000")).toThrow();
  });
});

describe("parseColorTokens", () => {
  it("reads light-dark() tokens from the :root, [data-theme] block only", () => {
    const parsed = parseColorTokens(`
      :root,
      [data-theme] { --paper: light-dark(#ffffff, #000000); }
      :root { --duration: 1ms; }
      .other { --ink: light-dark(#111111, #eeeeee); }
    `);
    expect(parsed).toEqual({ paper: { light: "#ffffff", dark: "#000000" } });
  });
});

describe("globals.css colour tokens", () => {
  it("declares every token as a 6-digit hex pair", () => {
    const all = Object.values(tokens);
    expect(all.length).toBeGreaterThanOrEqual(8);
    for (const { light, dark } of all) {
      expect(isHex(light), light).toBe(true);
      expect(isHex(dark), dark).toBe(true);
    }
  });

  it("defines every token the contrast pairs reference", () => {
    const names = new Set(CONTRAST_PAIRS.flatMap(({ fg, bg }) => [fg, bg]));
    for (const name of names) expect(tokens, name).toHaveProperty(name);
  });

  for (const theme of themes) {
    describe(`${theme} theme`, () => {
      const palette = resolvePalette(tokens, theme);
      it.each(CONTRAST_PAIRS)("$use: $fg on $bg ≥ $min", ({ fg, bg, min }) => {
        const ratio = contrastRatio(palette[fg] ?? "", palette[bg] ?? "");
        expect(ratio).toBeGreaterThanOrEqual(min);
      });
    });
  }
});
