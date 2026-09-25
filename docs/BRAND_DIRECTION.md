# Brand Direction

Stage 3 output. The working version lives in code: tokens in `app/globals.css`, primitives
in `components/ui/`, and the preview at `/design` (not indexed). This document records
why they look the way they do. Background research is in
[DESIGN_RESEARCH.md](DESIGN_RESEARCH.md) §4–6.

**Superseded for the chat (2026-09-26).** After the chat-first re-plan James chose a look close
to ChatGPT: near-black, neutral sans, white and greys. Stage 4 replaces the palette and the
serif and handwritten faces, and will rewrite this document. The mechanics in §6 and §8 (one
focus style, `light-dark()` tokens re-declared per `[data-theme]`) carry over.

**Status (Stage 3):** approved by James on 2026-09-26, with terracotta as the accent. The handwriting is
still Caveat until his own phrases are vectorised (§3).

## 1. Direction: sketchbook meets engineering lab

The portfolio is about someone who plans carefully and then builds careful systems. The look
pairs those two sides:

- **Paper and ink** are the base: warm off-white with a near-black navy by day, ink-blue
  paper with chalk text by night. Dark mode is a different sheet of paper, not an inverted
  screen.
- **One accent**, shared with the mascot, carries links, annotations, focus and small
  labels. Nothing else is coloured.
- **The engineering layer** is quiet structure: a faint 24 px grid (`bg-grid-paper`) behind
  diagrams, hairline rules, and a monospace face for code and tokens.
- **The human layer** is hand-drawn marks and a few handwritten phrases. They are
  decorative and never carry meaning on their own.

Avoided on purpose: gradients, glassmorphism, neon "AI" colour, particle backgrounds, and
paper textures with blend modes (the previous portfolio showed they lag on real devices).

## 2. Colour

Every colour token is declared once with `light-dark()`. Ratios below are the **lowest**
across the three surfaces (paper, raised, sunken). The contrast test checks every pair
in both themes, so these figures cannot quietly regress.

| Token | Light | Dark | Role | Lowest ratio (light / dark) |
|---|---|---|---|---|
| `paper` | `#f6f1e7` | `#141a26` | Page background | |
| `paper-raised` | `#fcfaf5` | `#1c2332` | Cards, controls | |
| `paper-sunken` | `#ece5d6` | `#0f141d` | Asides, wells | |
| `ink` | `#1b2233` | `#ede6d6` | Text, primary button | 12.7 / 12.6 |
| `ink-muted` | `#4f5566` | `#aaa395` | Secondary text | 5.9 / 6.3 |
| `line` | `#ddd4c3` | `#2c3446` | Decorative rules | decorative only |
| `line-strong` | `#8a8272` | `#7a766e` | Control borders | 3.0 / 3.5 (needs 3) |
| `grid` | `#e9e2d3` | `#1a2130` | Grid paper | decorative only |
| `accent` | `#a8482a` | `#e8906c` | Links, marks, labels | 4.6 / 6.5 |
| `on-accent` | `#fcfaf5` | `#141a26` | Text on accent fill | 5.6 / 7.2 |
| `focus` | = accent | = accent | Focus ring | 4.6 / 6.5 (needs 3) |

Text needs 4.5:1 (WCAG 1.4.3); control borders and focus rings need 3:1 (1.4.11).

**Accent.** Terracotta: warm and earthy, like a red pencil on paper, and it pairs with
mascot direction A's background. Ochre (`#855d0c` / `#d9a94a`) and slate (`#3d5a80` /
`#94b1d8`) were compared on `/design` and also passed every pair. Ochre felt more playful,
and slate sat too close to the ink to stand out.

## 3. Type

| Role | Face | Where | Rule |
|---|---|---|---|
| Voice | Instrument Serif (400, italic for emphasis) | Display, headings, card titles | Never below 22 px (`text-h3`) |
| Everything else | Instrument Sans (variable) | Body, UI, labels | Body 17 px / 1.65, 40 rem measure |
| Signature | Caveat 500 **(stand-in)** | Hero greeting, margin notes | At most about 5% of on-screen text. Never body copy, never UI labels |
| Code | System monospace | Code, tokens | No web font |

The type scale is fluid (`text-display`, `text-h1`, `text-h2`, then fixed `text-h3`,
`text-body`, `text-ui`, `text-small`, `text-eyebrow`). All faces load through
`next/font/google`, so they are self-hosted and cause no layout shift.

**Handwriting.** The plan is James's own handwriting: 5–10 phrases written by hand and
vectorised to SVG. Until those exist, `Handwritten` renders Caveat. When the SVGs arrive, the
component maps each phrase to its SVG (`role="img"`, labelled with the phrase) and keeps
Caveat for any phrase without one. No call site changes.

## 4. Marks and annotations

`Underline`, `Circled` and `Arrow` in `components/ui/annotation.tsx`.

- Drawn in the accent, with round caps and a slightly uneven line. The pen overshoots where
  it started, as a real one does.
- Always `aria-hidden`. The text they decorate must make sense without them.
- At most one or two per view. They mark the single most important word, not every
  keyword.
- Paths use `pathLength={1}`, ready for Stage 8 to draw each one once when it comes into view.
  They never loop. Under reduced motion they render fully drawn.

## 5. Space, shape and depth

- **Spacing:** Tailwind's 4 px scale. Sections use `py-16`; page gutters are 16 px on phones
  and 24 px from `sm` up. The page container is `max-w-page` (72 rem) and prose is
  `max-w-reading` (40 rem).
- **Radius:** `sm` 4 px (small tags), `md` 8 px (buttons, inputs), `lg` 14 px (cards,
  panels), `full` (chips).
- **Shadow:** `shadow-paper` for raised cards and `shadow-lifted` for overlays such as the
  chat sheet. Both are warm-tinted in light and plain black in dark, where surfaces rely more
  on lightness than on shadow.
- **Targets:** every button and chip is at least 44 px tall. Inline text links are exempt,
  as WCAG 2.5.8 allows.

## 6. Focus

One style everywhere: a 2 px solid ring in `focus`, offset 3 px from the element, on
`:focus-visible` only. The offset keeps the ring readable on filled buttons and chips.

## 7. Motion tokens

| Token | Value | Use |
|---|---|---|
| `--duration-fast` | 150 ms | Hover, press |
| `--duration-base` | 200 ms | Menus, chips |
| `--duration-slow` | 250 ms | Panels, the chat sheet |
| `--duration-editorial` | 550 ms | Annotation and diagram reveals |
| `ease-out` | `cubic-bezier(0.22, 1, 0.36, 1)` | Entrances |
| `ease-in-out` | `cubic-bezier(0.65, 0, 0.35, 1)` | Moves |

All durations drop to 0 under `prefers-reduced-motion: reduce` and under
`data-motion="reduce"` (the hook for the Stage 8 in-site toggle). No bounce on text; one
signature moment per view.

## 8. Theming mechanics

- The OS preference sets the theme through `color-scheme: light dark`. `data-theme="light"` or
  `"dark"` on any element forces its subtree. This is how `/design` shows both themes side by side
  without JavaScript, and how a Stage 8 toggle would work.
- Tailwind's CSS compiler (Lightning CSS) rewrites `light-dark()` into a variable polyfill
  that resolves where a token is **declared**, not where it is used. So the tokens are
  re-declared on every `[data-theme]` element. Any future scoped override (for example a
  per-section accent) must be declared on a themed element or inside one. Hand-written CSS uses the raw variables (`var(--paper)`), not
  Tailwind's `--color-*` copies. A Playwright test forces both themes under both OS
  preferences to catch a regression.
- Colours are used through semantic utilities (`bg-paper`, `text-ink-muted`, `border-line-strong`,
  `text-accent`), so components never need `dark:` variants.

## 9. Primitives

| Component | Element | Notes |
|---|---|---|
| `Button` / `ButtonLink` | `<button>` / `next/link` | `primary` (ink), `secondary` (outlined), `ghost`. `Button` for actions, `ButtonLink` for navigation |
| `Chip` | `<button>` | Suggested prompts. `selected` sets `aria-pressed` for filters |
| `TextLink` | `next/link` or `<a>` | Always underlined. External links get an arrow and `rel="noopener noreferrer"`, same tab |
| `Section` | `<section aria-labelledby>` | Anchor id, optional eyebrow and intro, h2 or h3 |
| `Card` | `div`, `article` or `li` | `raised` (default) or `sunken` |
| `Handwritten` | `<span>` | See §3 |
| `Underline`, `Circled`, `Arrow` | inline SVG | See §4 |

All are Server Components with no client JavaScript. Client components can still import
them.
