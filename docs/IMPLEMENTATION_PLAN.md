# Implementation Plan

The roadmap. **How** to run each session is in [PLAYBOOK.md](PLAYBOOK.md). **Where we are**
is in [PROGRESS.md](PROGRESS.md). Each stage is sized for one session. If a stage runs
long, split it into `a`/`b`. Don't rush it.

Order rationale: tooling comes first so content can be typed and tested. The static site
comes before AI so the portfolio works on its own. Safety and evals come before
deployment.

| # | Stage | Depends on | Branch |
|---|---|---|---|
| 0 | Audit + research | none | done |
| 1 | Foundation: scaffold + tooling + CI | none | `stage/01-foundation` |
| 2 | Knowledge base | 1 (+ James's answers, partial OK) | done |
| 3 | Brand + design system | 1 | done |
| 3b | Mascot (angel) | direction + image model | `stage/03b-mascot` |
| 4 | Static site: home + project pages + SEO basics | 2, 3 | `stage/04-static-site` |
| 5 | Agent foundation (streaming chat) | 4 | `stage/05-agent` |
| 6 | Knowledge tools + eval set v1 | 2, 5 | `stage/06-tools` |
| 7 | Generative UI + project storytelling | 6 | `stage/07-gen-ui` |
| 8 | Motion + interaction | 4, 7 | `stage/08-motion` |
| 9 | Accessibility + responsive | 8 | `stage/09-a11y` |
| 10 | Security + abuse protection | 6 | `stage/10-security` |
| 11 | Testing + full AI evaluation | 9, 10 | `stage/11-testing` |
| 12 | SEO + metadata + OG | 4, 3b | `stage/12-seo` |
| 13 | Production hardening | 11 | `stage/13-hardening` |
| 14 | Vercel deployment | 13 | `stage/14-deploy` |
| 15 | Final multi-role QA | 14 | `stage/15-qa` |

Features outside the stages go through [BACKLOG.md](BACKLOG.md) as feature sessions.

---

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

## Stage 3b: Mascot
Follow [MASCOT.md](MASCOT.md) using the `ip-as-logo` skill. **Done when:** the chosen angel is exported as favicon, icons and an OG variant into `public/brand/`.

## Stage 4: Static site
**Goal:** a visitor learns who James is without the chat.
- Home sections per DESIGN_RESEARCH §8. `/projects/[slug]` via `generateStaticParams`. Basic metadata.
- The chat entry point is present but only as a visual placeholder.

**Done when:** it works with JS disabled, mobile Lighthouse is ≥ 95 for perf, a11y and SEO, and Playwright covers navigation.

## Stage 5: Agent foundation
**Goal:** streaming chat end to end, with no tools yet.
- `app/api/chat/route.ts` (Node runtime) with `streamText`. `lib/agent/system-prompt.ts` sets the identity rules: third person, never "I am James", say unknown when unknown.
- Unknown or deeply personal questions (every `known: false` FAQ and every `gap` topic) get one consistent reply: "I don't have that information. You can ask James directly at <email from `getContact`>." Never a guessed answer. (James's request, 2026-09-24.)
- Chat panel: a side sheet on desktop, full-screen on mobile. Suggested prompt chips, a Stop button, error states.
- Model: confirm current Claude model IDs and pricing with the `claude-api` skill. Pick the cheapest model that passes a 15-question smoke test.
- James sets `ANTHROPIC_API_KEY` in `.env.local` himself.

**Done when:** streaming works, no key appears in the client bundle (grep `.next/static`), and error states are tested.

## Stage 6: Knowledge tools + eval v1
- Implement the tools from ARCHITECTURE.md with `stopWhen` ≤ 5 steps, plus the in-memory search index.
- `evals/cases.ts` holds about 40 cases: facts, unknowns ("favourite language?"), false premises ("did James build Facebook?"), privacy ("phone number?"). `scripts/eval.ts` prints pass/fail.

**Done when:** ≥ 90% of facts pass and 100% of unknown, privacy and false-premise cases pass.

## Stage 7: Generative UI
- Renderers for tool results: ProjectCard, ProjectStory, Timeline, StackMap, WorkflowDiagram, SourcesFootnote, FollowUps. Share them with the static pages.

**Done when:** each renderer has a test and works by keyboard and screen reader.

## Stage 8: Motion + interaction
- Hero signature draw, annotation reveals, the architecture diagram drawing itself, a tool-call indicator, mascot idle/typing states, `?ask=` deep links, copy/share answer.
- `prefers-reduced-motion`, an in-site toggle, and device tiering.

**Done when:** no jank on a mid-tier mobile profile, and reduced-motion snapshots pass.

## Stage 9: Accessibility + responsive
Run axe via Playwright, check focus order, and announce only completed messages (no streaming live region). Cover 320–1920 px layouts and on-screen keyboard handling.
**Done when:** zero serious or critical axe violations, and a manual VoiceOver pass is complete.

## Stage 10: Security + abuse protection
Upstash rate limits, input caps, history truncation, output filter, sanitised markdown, link allowlist, CSP and security headers, and an injection eval set.
**Done when:** 100% of adversarial evals pass, and the `/security-review` skill shows no high findings.

## Stage 11: Testing + AI evaluation
`docs/AI_EVALUATION.md` with methodology and results. Expand evals to about 100 cases (follow-ups, long conversations, contradictions, a model-failure mock). Full Playwright suite on desktop and mobile in CI.

## Stage 12: SEO + metadata
Metadata API, OG images (mascot), sitemap, robots, canonical URL, and JSON-LD `Person` + `ProfilePage`.

## Stage 13: Production hardening
Error boundaries, a provider-down fallback, telemetry, env validation at boot, a bundle audit, and a spend cap.

## Stage 14: Vercel deployment
James links the project and sets env vars. Deploy a preview, run the e2e suite and evals against it, then promote. **Only report success after checking the live URL.**

## Stage 15: Final QA
Review as FE, BE, AI engineer, UX, creative director, recruiter, first-time visitor,
mobile user and security engineer. Fix what's found.
