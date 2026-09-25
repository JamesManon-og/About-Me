# Implementation Plan

The roadmap. **How** to run each session is in [PLAYBOOK.md](PLAYBOOK.md). **Where we are**
is in [PROGRESS.md](PROGRESS.md). Each stage is sized for one session. If a stage runs
long, split it into `a`/`b`. Don't rush it.

**Re-planned 2026-09-26: chat-first.** The product is a chatbot that answers questions
about James, not a portfolio website with an assistant attached. Opening the site shows a
single question and an input, like ChatGPT's empty state, and the conversation takes over
the page. Stages 0 to 3 stand. The static portfolio pages built during the first Stage 4
attempt were removed before commit. The old stages 4 to 15 are replaced by the stages below.

Order rationale: the chat works end to end first, then it is measured (evals), then it
gets richer answers. Security and evals come before deployment.

| # | Stage | Depends on | Branch |
|---|---|---|---|
| 0 | Audit + research | none | done |
| 1 | Foundation: scaffold + tooling + CI | none | done |
| 2 | Knowledge base | 1 (+ James's answers, partial OK) | done |
| 3 | Brand + design system (palette replaced in Stage 4) | 1 | done |
| 3b | Mascot (angel), optional | direction + image model | `stage/03b-mascot` |
| 4 | Chat MVP: landing, conversation, streaming route, grounded answers | 2, 3 | `stage/04-chat` |
| 5 | Evals v1 | 4 | `stage/05-evals` |
| 6 | Rich answers: cards, sources, follow-ups | 5 | `stage/06-rich-answers` |
| 7 | Security + abuse protection | 4 | `stage/07-security` |
| 8 | Polish: motion, accessibility, responsive | 6 | `stage/08-polish` |
| 9 | SEO + sharing | 4 | `stage/09-seo` |
| 10 | Hardening, Vercel deployment, final QA | 5–9 | `stage/10-ship` |
| C | Content: James fills the knowledge gaps | none, any time | `content/<topic>` |

Features outside the stages go through [BACKLOG.md](BACKLOG.md) as feature sessions.

---

## Stage 0: Audit + research
Done. Private facts ledger, questions for James and source audit, plus the public research
and planning docs.

## Stage 1: Foundation
**Goal:** an empty but production-grade Next.js app with every quality gate wired.
- Scaffold Next.js 16 (App Router, TS strict, Tailwind 4, ESLint) with **bun**, into the existing repo root. Keep `README.md`, `docs/`, `.claude/`, `CLAUDE.md`.
- Add Vitest, Playwright (chromium + mobile webkit projects) and Prettier. Scripts: `dev`, `build`, `lint`, `typecheck`, `test`, `test:e2e`, `check` (all gates).
- Add `lib/env.ts` for zod-validated env vars (none are required yet; the pattern is set up).
- Add GitHub Actions `ci.yml`: install, lint, typecheck, test, build on PRs.
- A placeholder home page with one Playwright smoke test.
- `.nvmrc` → 22.

**Done when:** `bun run check` and CI pass, and a fresh clone runs with `bun install && bun dev`.
**Risks:** create-next-app refusing a non-empty dir. Scaffold into a temp dir and move files in.

## Stage 2: Knowledge base
**Goal:** all public-safe knowledge about James, typed and sourced.
- `lib/knowledge/schema.ts`: zod schemas (Profile, Experience, Project + Story, Skill group, Principle, FAQ, Source, Link).
- `data/james/{profile,experience,projects,skills,principles,faq,links,sources}.ts` and `content/james/{about,engineering,leadership,philosophy,ai-workflow,problem-solving,communication,strengths,weaknesses,lessons,goals,interests}.md`, filled **only** from ledger rows that are Verified or confirmed by James. Unknowns stay `null`.
- `scripts/knowledge-gaps.ts` lists every `null` field, so James knows what to fill.
- Tests: schemas parse, every fact has ≥ 1 source, and no forbidden strings appear (phone pattern, private project names from a denylist).

**Done when:** tests pass and the gap report has been reviewed with James.
**Note:** it can start before every question is answered. Unanswered items remain `null`.

## Stage 3: Brand + design system
**Goal:** `docs/BRAND_DIRECTION.md` plus working tokens and primitives.
- Palette with rationale ("sketchbook meets engineering lab": paper, ink, one accent shared with the mascot), light and dark.
- Type: Instrument Serif + Instrument Sans (or Geist) via `next/font`. Handwriting: James's own, 5–10 phrases vectorised to SVG (fallback: Caveat).
- Tokens for spacing, radius, shadow, focus ring and motion durations/easings. Primitives: Button, Chip, Link, Annotation (SVG underline, arrow, circle), Section, Card.
- `/design` preview route (noindex).

**Done when:** all primitives render in both themes, text contrast is ≥ 4.5:1 (automated test), and James approves.

**Superseded in part (2026-09-26):** James chose a look close to ChatGPT for the chat, so
Stage 4 replaces the paper-and-ink palette and the serif and handwritten faces. The token
mechanics (one source in `app/globals.css`, `light-dark()`, the contrast test, `/design`)
stay.

## Stage 3b: Mascot (optional)
Follow [MASCOT.md](MASCOT.md) using the `ip-as-logo` skill. **Done when:** the chosen angel is
exported as favicon, icons and an OG variant into `public/brand/`, in the Stage 4 palette.

## Stage 4: Chat MVP
**Goal:** open the site, ask anything about James, and get a streamed answer grounded in the
knowledge base.

- **Look: close to ChatGPT** (James's choice, 2026-09-26). Near-black by default, with a
  light counterpart that follows the OS. A neutral system sans, and white and greys only.
  New tokens replace the Stage 3 palette in `app/globals.css`; the contrast test and
  `/design` follow them. Stage 3 pieces the chat no longer uses (Instrument Serif, Caveat,
  `Handwritten`, the annotation marks) are removed.
- **Empty state:** a centred question ("What do you want to know about James?"), a pill
  input (a labelled, auto-growing textarea; Enter sends, Shift+Enter adds a line), a round
  send button, and 3–4 suggestion chips. No "+" or mic button: there is nothing to attach,
  and voice stays in the backlog.
- **Conversation:** after the first message the input moves to the bottom and messages
  fill a centred column. User messages sit in a bubble; answers are plain text with
  sanitised markdown (no raw HTML). A Stop button while streaming, an error state with
  retry, and "New chat". A completed answer is announced once through a separate polite
  live region, never through the streaming node.
- **Route:** `app/api/chat/route.ts` (Node runtime) with AI SDK 7 `streamText` and the
  Anthropic provider. Validate the body now (at most 1,000 characters per message, the last
  20 messages, no empty input) and cap output tokens. The rest of abuse protection is
  Stage 7.
- **Grounding:** `lib/agent/knowledge-context.ts` turns `knowledge` and the published and
  partial `content/james/*.md` files (never gaps) into one text block, including each
  project's caveats as instructions. `lib/agent/system-prompt.ts` adds the identity rules:
  third person, never "I am James", answer only from the context, and for anything not in
  it reply "I don't have that information. You can ask James directly at <email>." The
  block is sent with Anthropic prompt caching. The whole corpus is about 11K tokens, so
  there is no search index yet.
- **Model:** confirm current model IDs and pricing with the `claude-api` skill, then pick
  the cheapest model that passes a 15-question smoke test.
- **Deployment prep:** `outputFileTracingIncludes` for `content/james/**` (or import the
  files at build time) so the route can read them on Vercel.
- **Crawlable minimum:** the heading and metadata are server-rendered, so the page is not
  blank to crawlers. Full SEO is Stage 9.
- **Dependencies** (justify each in the session plan): `ai`, `@ai-sdk/react`,
  `@ai-sdk/anthropic`, and one markdown renderer that does not render raw HTML.
- James sets `ANTHROPIC_API_KEY` in `.env.local` himself.

**Done when:** streaming works end to end; unknown and gap questions get the fixed reply;
Stop, error and retry are covered by Playwright with the API mocked; no key appears in
`.next/static`; and the chat works at 320 px and by keyboard.

**Status (2026-09-26):** built and tested on the mock model. Left: the live smoke test
(`bun run smoke:chat`) and the model choice, once `ANTHROPIC_API_KEY` is set.

## Stage 5: Evals v1
- `evals/cases.ts` holds about 40 cases: facts, unknowns ("favourite language?"), false
  premises ("did James build Facebook?"), privacy ("phone number?") and identity ("are you
  James?"). `scripts/eval.ts` runs them against the real route and prints pass/fail: string
  rules for refusals and the fixed reply, and a model-graded check for fact answers.

**Done when:** ≥ 90% of fact cases pass and 100% of unknown, privacy, false-premise and
identity cases pass.

## Stage 6: Rich answers
- Read-only display tools built on `lib/knowledge/queries.ts`: `getProject`,
  `listProjects`, `getTimeline`, `getSkills` and `getContact`. Each returns
  `{ data, sources }` and renders as a card in the conversation (ProjectCard, Timeline,
  StackMap, ContactCard), with a SourcesFootnote under fact-bearing answers and 2–3
  follow-up chips. `stopWhen` at most 5 steps.
- Re-run the Stage 5 evals. None may regress.

**Done when:** each renderer has a test and works by keyboard and screen reader.

## Stage 7: Security + abuse protection
Upstash rate limits (per IP, plus a global daily cap), input caps, history truncation, an
output filter (no phone numbers; email only from `getContact`), sanitised markdown, the link
allowlist from `data/james/links.ts`, CSP and security headers, and an injection eval set.

**Done when:** 100% of adversarial evals pass and `/security-review` shows no high findings.

## Stage 8: Polish: motion, accessibility, responsive
Message entrance, a typing indicator and tool status ("Looking up MoneyApp…"),
reduced-motion support, focus order, the on-screen keyboard on mobile
(`interactive-widget=resizes-content`), 320–1920 px layouts, and axe via Playwright.

**Done when:** zero serious or critical axe violations, a manual VoiceOver pass, and no
jank on a mid-tier mobile profile.

## Stage 9: SEO + sharing
Metadata, an OG image, JSON-LD `Person`, sitemap, robots and canonical URL. `?ask=` links
open the chat with a question filled in.

**Done when:** mobile Lighthouse SEO ≥ 95 and a shared `?ask=` link works.

## Stage 10: Hardening, deployment, final QA
Error boundaries, a provider-down fallback, telemetry, a spend cap, a bundle audit,
Playwright in CI, and `docs/AI_EVALUATION.md` with the evals expanded to about 100 cases
(follow-ups, long conversations, contradictions, a model-failure mock). Then James links the
Vercel project and sets env vars; deploy a preview, run e2e and evals against it, and
promote. Review as recruiter, first-time visitor, mobile user, AI engineer and security
engineer. **Only report success after checking the live URL.**

## Track C: Content (any time)
James answers the open gaps listed by `bun run knowledge:gaps`: target roles, strengths, a
weakness, hobbies, a lesson learned, the hardest bug, communication style, beliefs about
software, thesis results and other AI tools. Each answer goes into the private ledger first,
then into `data/` or `content/`. The bot can only say what the knowledge base holds, so
this is how it learns to answer more.
