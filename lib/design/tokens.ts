/**
 * Reads the colour tokens out of app/globals.css so the CSS stays the single source of
 * truth. Colour tokens are declared as `--name: light-dark(#light, #dark);` inside the
 * `:root, [data-theme]` block.
 */

export type Theme = "light" | "dark";
export type ThemedColor = { light: string; dark: string };
export type ColorTokens = Record<string, ThemedColor>;

const BLOCK = /:root,\s*\[data-theme\]\s*\{([^{}]*)\}/g;
const COLOR_DECL =
  /--([a-z0-9-]+)\s*:\s*light-dark\(\s*([^,\s]+)\s*,\s*([^)\s]+)\s*\)/g;

export function parseColorTokens(css: string): ColorTokens {
  const tokens: ColorTokens = {};
  for (const block of css.matchAll(BLOCK)) {
    for (const decl of (block[1] ?? "").matchAll(COLOR_DECL)) {
      const [, name, light, dark] = decl;
      if (name && light && dark) tokens[name] = { light, dark };
    }
  }
  return tokens;
}

/** Flat name → hex map for one theme. */
export function resolvePalette(
  tokens: ColorTokens,
  theme: Theme,
): Record<string, string> {
  return Object.fromEntries(
    Object.entries(tokens).map(([name, value]) => [name, value[theme]]),
  );
}

export type ContrastPair = {
  fg: string;
  bg: string;
  /** 4.5 for text, 3 for UI boundaries and focus indicators (WCAG 1.4.3, 1.4.11). */
  min: number;
  use: string;
};

/** Surfaces that carry text. */
const TEXT_SURFACES = ["page", "surface", "surface-hover"] as const;
/** Surfaces a bordered or focused control sits on. */
const CONTROL_SURFACES = ["page", "surface"] as const;

export const CONTRAST_PAIRS: ContrastPair[] = [
  ...TEXT_SURFACES.flatMap((bg) => [
    { fg: "fg", bg, min: 4.5, use: "Body text" },
    { fg: "fg-muted", bg, min: 4.5, use: "Secondary text" },
  ]),
  ...CONTROL_SURFACES.flatMap((bg) => [
    { fg: "line-strong", bg, min: 3, use: "Control borders" },
    { fg: "focus", bg, min: 3, use: "Focus ring" },
  ]),
  { fg: "page", bg: "fg", min: 4.5, use: "Send button and primary button" },
];
