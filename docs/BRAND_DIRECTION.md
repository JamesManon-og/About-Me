# Brand Direction

The working version lives in code: tokens in `app/globals.css`, primitives in
`components/ui/`, the chat in `components/chat/`, and the preview at `/design` (not
indexed). This document records why they look the way they do.

**Stage 4 (2026-09-26): close to ChatGPT.** After the chat-first re-plan, James chose a look
close to ChatGPT's: near-black by default, white by day, a neutral sans, and white and greys
only. It replaces the Stage 3 "sketchbook meets engineering lab" palette (paper, ink,
terracotta), the Instrument Serif and Instrument Sans faces, the Caveat handwriting and the
annotation marks. The Stage 3 mechanics stay: one token source in CSS, `light-dark()`
re-declared per `[data-theme]` (§6), the automated contrast test, and `/design`. The Stage 3
version of this document is in git history (PR #4).

## 1. Direction

The chat is the product, so the page gets out of its way:

- **One surface.** The page colour, one filled grey for the composer and the visitor's
  bubbles, and a slightly darker grey for hover. No cards, no shadows, no gradients.
- **No accent colour.** Text is near-white on near-black (or the reverse by day). Links are
  underlined, so colour never carries meaning on its own.
- **The answer is plain text.** Answers sit directly on the page, without a bubble, in the
  body face. Only the visitor's messages are in bubbles.

## 2. Colour

Every colour token is declared once with `light-dark()`. The contrast test checks every
pair in both themes, so these figures cannot quietly regress.

| Token | Light | Dark | Role | Lowest ratio (light / dark) |
|---|---|---|---|---|
| `page` | `#ffffff` | `#212121` | Page background | |
| `surface` | `#f4f4f4` | `#303030` | Composer, visitor bubbles, code | |
| `surface-hover` | `#e9e9e9` | `#3c3c3c` | Hover on ghost buttons and chips | |
| `fg` | `#0d0d0d` | `#ececec` | Text, send button fill | 16.0 / 9.3 |
| `fg-muted` | `#5d5d5d` | `#b4b4b4` | Secondary text, placeholder | 5.4 / 5.3 |
| `line` | `#e5e5e5` | `#383838` | Hairlines, composer border | decorative only |
| `line-strong` | `#858585` | `#7d7d7d` | Control borders, composer focus | 3.35 / 3.2 (needs 3) |
| `focus` | = `fg` | = `fg` | Focus ring | 17.7 / 11.2 (needs 3) |

Text needs 4.5:1 (WCAG 1.4.3). Control borders and focus rings need 3:1 (1.4.11). Text
ratios are the lowest across `page`, `surface` and `surface-hover`; border and focus ratios
are the lowest across `page` and `surface`.

## 3. Type

The system sans (`ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, …`) and the
system monospace. No web fonts: nothing to download before the first paint. The Stage 3
Lighthouse run showed that four preloaded font files made up most of the LCP delay.

| Token | Size | Use |
|---|---|---|
| `text-title` | 24–32 px, fluid | The empty-state question |
| `text-h2` | 20 px | Section headings on `/design` |
| `text-body` | 16 px / 1.6 | Answers, messages, input |
| `text-small` | 14 px | Buttons, chips |
| `text-caption` | 12 px | The line under the composer |

Weights: 400 for text, 500 for controls, 600 for the name and the question.

## 4. Layout

- **Empty state:** your name top left, the question centred with the composer under it, one
  suggestion chip, and the disclaimer at the foot of the page.
- **Conversation:** a centred column (`max-w-chat`, 48 rem) with a 16 px gutter. The page
  itself scrolls; the header sticks to the top and the composer to the bottom. New chat
  appears in the header.
- **Shape:** the composer is a pill (28 px radius); bubbles use `rounded-3xl`; chips and
  buttons are fully rounded. Radius tokens: `sm` 6 px, `md` 12 px, `lg` 24 px.
- **Targets:** buttons and chips are at least 44 px tall. The round send button is 36 px,
  above the 24 px minimum of WCAG 2.5.8.

## 5. Focus

One style everywhere: a 2 px solid ring in `focus`, offset 3 px from the element, on
`:focus-visible` only.

One exception: the composer. The textarea's own ring is replaced by a 2 px `line-strong`
outline on the whole pill, because the caret already shows where typing goes and a
near-white ring around the pill on every keystroke is heavy. `line-strong` still meets 3:1.
The send and stop button keeps the standard ring.

## 6. Theming mechanics

- The OS preference sets the theme through `color-scheme: light dark`. `data-theme="light"`
  or `"dark"` on any element forces its subtree. This is how `/design` shows both themes side
  by side without JavaScript.
- Tailwind's CSS compiler (Lightning CSS) rewrites `light-dark()` into a variable polyfill
  that resolves where a token is **declared**, not where it is used. So the tokens are
  re-declared on every `[data-theme]` element. Hand-written CSS uses the raw variables
  (`var(--page)`), not Tailwind's `--color-*` copies. A Playwright test forces both themes
  under both OS preferences to catch a regression.
- Colours are used through semantic utilities (`bg-page`, `bg-surface`, `text-fg-muted`,
  `border-line-strong`), so components never need `dark:` variants.

## 7. Motion tokens

| Token | Value | Use |
|---|---|---|
| `--duration-fast` | 150 ms | Hover, press, the send button's disabled fade |
| `--duration-base` | 200 ms | Menus, chips |
| `--duration-slow` | 250 ms | Message entrance (Stage 8) |
| `ease-out` | `cubic-bezier(0.22, 1, 0.36, 1)` | Entrances |
| `ease-in-out` | `cubic-bezier(0.65, 0, 0.35, 1)` | Moves |

All durations drop to 0 under `prefers-reduced-motion: reduce` and under
`data-motion="reduce"` (the hook for the Stage 8 in-site toggle). The "answering" dot only
pulses when motion is allowed.

## 8. Primitives

| Component | Element | Notes |
|---|---|---|
| `Button` / `ButtonLink` | `<button>` / `next/link` | `primary` (fg fill), `secondary` (outlined), `ghost`. `Button` for actions, `ButtonLink` for navigation |
| `Chip` | `<button>` | Suggested questions. `selected` sets `aria-pressed` for filters |
| `TextLink` | `next/link` or `<a>` | Always underlined. External links get an arrow and `rel="noopener noreferrer"` |
| `Card` | `div`, `article` or `li` | `outlined` (default) or `filled`. Kept for the Stage 6 answer cards |

All are Server Components with no client JavaScript. Client components can still import
them. The chat's own pieces (composer, message list, answer Markdown) live in
`components/chat/`.
