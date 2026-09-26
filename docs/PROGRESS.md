# Progress

Updated at the end of every session. Newest entry first. This file plus `git log` is the
hand-off between sessions.

## Current state

| | |
|---|---|
| Current stage | **Ready to deploy.** Prebuilt answers (Stage 5), SEO (Stage 9) and the keyless parts of Stages 7, 8 and 10 are built and tested |
| Last completed | Prebuilt answers, SEO and deployment prep (2026-09-26) |
| Blocked on James | 1. Read and approve every answer in `data/james/faq.ts`. 2. A VoiceOver pass. 3. Import the repo on Vercel and run the live checks in `docs/DEPLOYMENT.md` |
| Known issues | Don't set `ANTHROPIC_API_KEY` in production before rate limits exist (BACKLOG `claude-path-guards`). Two validation questions fall back ("Does James speak Java?", "is he open to remote roles") |

## Stage checklist

Re-planned 2026-09-26. Old stages 4–15 were replaced; see IMPLEMENTATION_PLAN.md.

- [x] 0 Audit + research
- [x] 1 Foundation
- [x] 2 Knowledge base
- [x] 3 Brand + design system (palette replaced in Stage 4)
- [ ] 3b Mascot (optional)
- [x] 4 Chat MVP (the Claude path stays optional, behind a key)
- [ ] 5 Prebuilt answers, matcher and evals (built; James's review of the answers left)
- [ ] 6 Rich answers (follow-up chips done; cards deferred to BACKLOG `answer-cards`)
- [ ] 7 Security + abuse protection (keyless parts done; `claude-path-guards` before any key)
- [ ] 8 Polish: motion, accessibility, responsive (axe clean; VoiceOver pass left)
- [x] 9 SEO + sharing
- [ ] 10 Hardening, deployment, final QA (ready; James deploys and checks the live URL)
- [ ] C Content: knowledge gaps (ongoing)

## Log

### 2026-09-26: Prebuilt answers, evals, SEO and deployment prep
- **Why:** James didn't want the site to need an API key or cost money to run. Asked for
  options, he chose "prebuilt answers first, Claude optional". Midway he asked for a warmer,
  more human voice, and then to finish everything up to deployment in this session.
- **Done:**
  - **Answer set** (`data/james/faq.ts`): 66 entries (60 answers, 6 known gaps), each with
    sources, 221 alternative phrasings, follow-up chips, and keywords for specific names.
    Written from the knowledge base only, in a warmer voice: lead with the point and the
    thinking behind the work. The existing 15 FAQs were rewritten in that voice. Greeting and
    thanks entries added. The FAQ schema gained `variants`, `followUps` and `keywords`.
  - **Matcher** (`lib/answers/match.ts`, no dependency): word folding, synonyms, stemming,
    typo tolerance, rarity weights, phrase and whole-entry scoring, exact match for chips, and
    a coverage threshold so unfamiliar names fall back. Follow-ups inherit the project from
    the conversation (`lib/answers/respond.ts`).
  - **Route:** a matched question streams the approved answer, with no model. An unmatched
    one gets the fixed unknown reply plus the three closest questions, or Claude if a key is
    set. Message metadata says which path answered; chips travel as a `data-suggestions` part.
  - **UI:** "Related" chips under answers and "Closest questions I can answer" under the
    fallback, as mocked and approved. The composer refits its height when its width changes.
  - **Evals:** 97 cases (47 from earlier, 20 casual paraphrases, 30 validation questions).
    `bun run eval` grades prebuilt answers by rules plus routing and is free without a key.
    The judge only grades answers Claude writes. `evals/routing.test.ts` gates routing in
    `bun run check`. The Stage 4 smoke test was folded in and removed.
  - **SEO (Stage 9):** metadata and canonical URL (`lib/site.ts`), share image, JSON-LD
    `Person`, sitemap, robots, and `?ask=` links that ask on arrival.
  - **Security (Stage 7, keyless parts):** CSP and hardening headers (`lib/security/headers.ts`),
    no `X-Powered-By`.
  - **Hardening (Stages 8 and 10):** axe checks in e2e (new dev dependency
    `@axe-core/playwright`), error and 404 pages, `interactive-widget=resizes-content`,
    Playwright job in CI, `vercel.json` (region `sin1`), and `docs/DEPLOYMENT.md`.
- **Checks:**
  - `bun run check` green: 265 unit tests, the build and `scan:static`. The build lists `/`,
    the share image, robots and the sitemap as static.
  - `bun run test:e2e`: 48 passed, 2 skipped (WebKit Tab, as before).
  - `bun run eval`, no key: facts 59/61 (96.7%), unknown 14/14, false premise 7/7,
    privacy 8/8, identity 7/7. No model calls.
  - Mobile Lighthouse on the production build: performance 96, accessibility 100,
    best practices 96, SEO 100.
  - Browser pane at 375 px: fallback chips, `?ask=` link, no sideways scroll, no console
    errors, no CSP violations.
  - Off-topic, injection and unknown-name questions (31 tried) all fall back, except
    Spring Boot and Docker, which correctly land on skills and DevOps.
- **Measured honestly:** routing was tuned against the first 67 cases, which reached 67/67.
  The 30 validation questions were written afterwards: first score 17/30, with every miss a
  safe fallback and no wrong answers. After general fixes (synonyms, stopwords, whole-entry
  scoring, a few natural phrasings) it reached 28/30. Two expectations were corrected where
  the fallback met the case's own criterion. The validation set has now been tuned on, so
  BACKLOG `routing-holdout` is the next honest measure.
- **Decisions:** see the ARCHITECTURE.md decisions log (prebuilt first, hand-written matcher,
  coverage threshold 0.65, project entity rule, fallback text plus chips, metadata per path,
  routing gate in `check`, warmer voice, CSP without nonces, canonical URL fallback, `?ask=`
  on the client, axe, region).
- **Left:**
  - James: review every answer in `data/james/faq.ts`, since the site shows them word for word.
  - James: a VoiceOver pass (Stage 8).
  - James: the Vercel import and deploy, then the live checks in `docs/DEPLOYMENT.md`.
  - Before any key in production: BACKLOG `claude-path-guards`.
  - Deferred: answer cards and a sources footnote (BACKLOG `answer-cards`).
- **Issues found:**
  - A textarea mounted at zero width (a tab that loaded while hidden) stayed 200 px tall. It
    now refits when its width changes.
  - The e2e "last answer" helper matched bullets inside an answer's own Markdown list. It is
    now scoped to the conversation's items.
  - Lighthouse flags one CSP "inspector issue" with no URL. No violation fires in the page
    itself, so it looks like Lighthouse's own instrumentation.
- **Next:** James reviews the answers and deploys. After that, content sessions (Track C)
  fill the known gaps, and each new fact becomes an answer in `data/james/faq.ts`.

### 2026-09-26: Stage 4: Chat MVP (built, live check pending)
- **Done:**
  - **Look:** new neutral tokens in `app/globals.css` (`page`, `surface`, `surface-hover`, `fg`, `fg-muted`, `line`, `line-strong`, `focus`), system sans, no web fonts. Removed Instrument Serif, Instrument Sans, Caveat, `Handwritten`, the annotation marks and `Section`. `Button`, `Chip`, `Card` and `TextLink` restyled; `/design`, the contrast pairs and `e2e/design.spec.ts` follow the new tokens. `docs/BRAND_DIRECTION.md` rewritten.
  - **Chat UI** (`components/chat/`), as approved from the mock: your name top left; the question, a pill composer and one suggestion chip ("What can James do?") centred; the disclaimer at the foot. After the first question the composer sticks to the bottom and New chat appears. Enter sends, Shift+Enter adds a line, 1,000-character cap with a count from 900. Send and Stop are one button. Error with Retry. Answers render as Markdown without raw HTML or images, and links open in a new tab. The finished answer, "Answer stopped." and errors are announced once through a separate polite live region.
  - **Route** `app/api/chat/route.ts`: body validation (`lib/agent/request.ts`: text parts only, 1,000 characters per question, last 20 messages, starts on a user turn, 200 KB body cap), `streamText` with a 1,024-token output cap, a 45 s timeout and `maxDuration = 60`. It answers 503 when no key is set. Token usage (never content) is logged as `[chat] finished`.
  - **Grounding:** `lib/agent/knowledge-context.ts` serialises the knowledge base and the published and partial notes (never gaps), including each project's rules and "Not on record" for unknown fields. `lib/agent/system-prompt.ts` holds the rules: third person, never James, context only, the exact unknown reply with his email, privacy, scope, style. The combined prompt is about 7K tokens, cached as one system message.
  - **Model:** `lib/agent/model.ts`. Default `claude-haiku-4-5` (confirmed with the `claude-api` skill: $1 / $5 per million tokens, caches prompts from 4,096 tokens), overridable with `CHAT_MODEL`. `CHAT_MODEL_MOCK=1` uses a scripted mock model (refused on a Vercel production deployment); e2e and `dev-mock` in `.claude/launch.json` use it.
  - **Deploy prep:** `outputFileTracingIncludes` for `content/james/**/*.md` (confirmed in the route's trace file). `scan:static` checks `.next/static` for API key patterns, the configured key and server-only variable names; it runs in `check` and CI.
  - `scripts/smoke-chat.ts` (`bun run smoke:chat`): the 15-question live smoke test (8 facts, 4 unknowns, false premise, privacy, identity), ready for when the key is set.
  - New dependencies: `ai` 7.0 (streaming and the UI message stream), `@ai-sdk/react` 4.0 (`useChat`), `@ai-sdk/anthropic` 4.0 (Claude provider with caching), `react-markdown` 10 (Markdown without raw HTML).
- **Checks:** `bun run check` green: 160 unit tests (32 new: request validation, knowledge context and prompt, model selection, the route's 400/503/stream paths, env rules, plain-text announcements, secret scan), build, and `scan:static` (13 client files, no secrets). `bun run test:e2e` 34 passed, 2 skipped (WebKit Tab, as before); the chat suite also passed three repeats in a row. Visual pass in the browser pane: desktop and 320 px, dark and light, no sideways scroll.
- **Decisions:** see the ARCHITECTURE.md decisions log (no AI Elements, `react-markdown` over Streamdown, cached single system message, Haiku default pending the smoke test, the mock model flag, optional key, text-only messages, page scrolling, announcements, one Send/Stop button, `scan:static`). James approved the layout from a mock and chose a single suggestion chip.
- **Left (Stage 4 "Done when"):**
  - Streaming end to end with the real model, and the fixed reply for unknown and gap questions: needs `ANTHROPIC_API_KEY`. Then run `bun dev` and `bun run smoke:chat`, read the answers, and check `[chat] finished` in the server log shows cache reads from the second question on. If Haiku 4.5 fails cases, try `CHAT_MODEL=claude-sonnet-5`.
  - Stop, error and retry in Playwright, no key in `.next/static`, 320 px and keyboard: done.
- **Issues found:**
  - The browser pane's screenshots don't show the send button's 30% opacity when it has nothing to send; the computed style and Playwright screenshots do.
  - Before any key is set, `bun dev` shows "The answer couldn't be loaded." for every question (the route's 503). `CHAT_MODEL_MOCK=1 bun dev` works without a key.
  - A reload loses the conversation. Added `conversation-persistence` to BACKLOG.md.
- **Next:** finish Stage 4 with the live smoke test (a short session once the key is in `.env.local`), then Stage 5 (evals v1).

### 2026-09-26: Re-plan: chat-first
- **Why:** partway through the first Stage 4 (static portfolio site), James decided the
  product should be a chatbot that answers everything about him, not a portfolio site. His
  reference is ChatGPT's empty state: one question, one input, a suggestion.
- **Decisions (James):** the chat is the whole site; the look is close to ChatGPT
  (near-black, neutral sans, white and greys), replacing the Stage 3 palette and fonts; the
  assistant still speaks about James in the third person; this session re-plans, and the
  chat is built in the next one.
- **Done:**
  - Removed the uncommitted static site: home sections, `/projects/[slug]` pages, site
    header and footer, 404 page, `ChipLink`, `TagList`, and `e2e/site.spec.ts`. The layout,
    home placeholder, `/design` and `globals.css` are back to their Stage 3 state.
  - Kept, for Stage 6 answer cards and tools: `lib/knowledge/queries.ts` (`getProject`,
    `projectNeighbours`, `faqForProject`, `sourcesCitedIn`, `linksOfKind`),
    `lib/knowledge/format.ts` (partial-date ranges, collaboration and status labels), and an
    optional, cross-checked `relatedProjects` on known FAQs (MoneyApp payments, thesis team,
    thesis framework). All with tests.
  - Rewrote IMPLEMENTATION_PLAN.md (stages 4–10 plus Track C) and updated CLAUDE.md,
    ARCHITECTURE.md (shape, full-context grounding, tools only for rich answers, decisions
    log), README, BACKLOG, MASCOT, and superseded notes in DESIGN_RESEARCH and
    BRAND_DIRECTION.
  - `.claude/launch.json` gained a `prod` configuration (`next start` on port 3100) for
    Lighthouse and production checks.
- **Checks:** `bun run check` green, 128 unit tests (23 new for the kept helpers and the FAQ
  cross-check). `bun run test:e2e` 13 passed, 1 skipped (WebKit Tab, as in Stage 3). The build
  lists `/`, `/_not-found` and `/design` only.
- **Left:** everything from Stage 4 on. The Stage 3 home placeholder and `/design` stay until
  Stage 4 replaces them.
- **Issues found:**
  - Mobile Lighthouse ran fine with `bunx lighthouse` against the installed Chrome and the
    production server (no dependency added). The static home scored 94 performance, 100
    accessibility, best practices and SEO. LCP was the hero paragraph, and 85% of it was
    render delay behind four preloaded font files (about 111 KB). The ChatGPT-like system
    sans avoids that cost entirely.
  - With `dynamicParams = false`, `next start` 16.3.6 logs `Error: Internal:
    NoFallbackError` for unknown slugs while still returning a correct 404. Nothing uses
    dynamic segments now; re-check after upgrading to 16.3.7.
  - After deleting a route, stale types in `.next/dev/types` (written by `next dev`) broke
    `tsc`. Deleting `.next/dev` fixed it.
- **Next:** Stage 4 (chat MVP). James adds `ANTHROPIC_API_KEY` to `.env.local` first.

### 2026-09-26: Stage 3: Brand + design system
- **Done:**
  - `app/globals.css`: colour tokens (paper, ink, lines, grid, terracotta accent, focus, shadow tint) declared once with `light-dark()`. The OS picks the theme; `data-theme` forces it for a subtree. Fluid type scale, radius, shadows, easings, reading/page containers, and motion durations that drop to 0 under reduced motion or `data-motion="reduce"`. One global `:focus-visible` ring.
  - `app/layout.tsx`: Instrument Serif, Instrument Sans and Caveat (handwriting stand-in) via `next/font/google`.
  - `components/ui/`: `Button`, `ButtonLink`, `Chip`, `TextLink`, `Section`, `Card`, `Handwritten`, and `Underline` / `Circled` / `Arrow` marks. Server Components with no client JS and no new dependencies. Buttons and chips are 44 px tall.
  - `/design` (noindex): every token and primitive in light and dark side by side, with the contrast ratios read from the CSS.
  - `lib/design/contrast.ts` + `tokens.ts`: WCAG contrast math and a parser that reads the tokens from `globals.css`, so the CSS is the only source. The contrast test covers every text, border and focus pair in both themes (checked that it fails when a token is made too light).
  - `e2e/design.spec.ts`: no console errors, noindex, forced themes under both OS preferences, focus ring on keyboard focus, reduced-motion durations.
  - `docs/BRAND_DIRECTION.md`: palette, type, annotation, spacing, focus, motion and theming rationale.
- **Checks:** `bun run check` green, 105 tests. `bun run test:e2e` 13 passed, 1 skipped (WebKit's Tab key skips buttons, as Safari does; Chromium covers it). Visual pass in the browser pane at desktop and 375 px, both themes, no horizontal scroll.
- **Decisions:** see the ARCHITECTURE.md decisions log (`light-dark()` re-declared per `[data-theme]`, CSS as the single token source, dependency-free primitives, Caveat behind `Handwritten`, terracotta accent). James approved the direction with the defaults: terracotta over ochre and slate, Instrument Sans, Caveat until his handwriting is ready.
- **Left:**
  - James's handwriting: 5–10 phrases to vectorise into `Handwritten`. Not blocking.
  - Annotation draw-on animation and the in-site reduced-motion toggle are Stage 8 (paths already use `pathLength={1}`; the `data-motion` hook exists).
- **Issues found:**
  - Tailwind's Lightning CSS compiles `light-dark()` into a variable polyfill that resolves where a token is declared, so a forced-theme panel inherited the OS theme. Fixed by re-declaring tokens on `[data-theme]`; covered by e2e. Details in BRAND_DIRECTION.md §8.
  - The Stage 2 phone-number scan flagged SVG path data. `findPhoneNumbers` now skips `d`, `viewBox` and `points` attributes, with tests.
  - Added `.claude/launch.json` (dev server for the desktop app's preview pane). Optional to keep.
- **Next:** Stage 4 (static site), which needs Stages 2 and 3, both done. Stage 3b (mascot) can run whenever James picks a direction and image model.

### 2026-09-24: Stage 2: Knowledge base
- **Done:**
  - `lib/knowledge/schema.ts`: zod schemas for sources, facts, links, profile, experience, leadership, projects + story, skills, certifications, principles, FAQ and content frontmatter. Every fact needs at least one source. `KnowledgeSchema` checks source ids, project slugs and duplicate ids.
  - `data/james/`: profile, experience + leadership, 4 projects (MoneyApp, JobPilot, thesis, ADTO), skills + certifications, 7 observed principles, 15 FAQs (4 deliberate unknowns), 13 links (the Stage 10 link allowlist, including 6 credential links) and 10 sources. Validated once in `lib/knowledge/james.ts`.
  - `content/james/`: 12 topics. 2 published, 4 partial, 6 gap placeholders. `lib/knowledge/content.ts` loads them and never returns gaps.
  - `scripts/knowledge-gaps.ts` (`bun run knowledge:gaps`): 24 gaps listed.
  - Tests: schema rules, cross-references, content frontmatter, gap finder, and a forbidden-content scan of app/, components/, content/, data/, lib/, public docs and root docs (hashed private names, phone numbers, emails other than the public contact).
- **Facts updated (James, 2026-09-24):** both GitHub accounts and the LinkedIn URL he supplied; Gmail as public contact; Symph Cebu City; SYSDEV on-site; Orange & Bronze remote; JobPilot solo and active; ADTO 2025; thesis framework PyTorch; his own part of the thesis (published as "According to James", the project stays a 3-person group thesis); self-description and senior-level goal. James delegated the remaining calls; see the ledger's "Decisions delegated" section.
- **LinkedIn (read with James signed in):** added as a source. The six certifications now carry public verification links, which are also in the link allowlist. Spring MVC and unit/integration testing were added to skills. Generic soft-skill tags were left out as unevidenced.
- **Checks:** `bun run check` green, 63 tests. The gap report was reviewed with James.
- **Decisions:** see the ARCHITECTURE.md decisions log (content frontmatter parser, content status, cross-reference validation, hashed denylist, unknown → email).
- **Left:**
  - James's answers for the remaining gaps: specific target roles, thesis results, weakness, hobbies, a lesson learned, hardest bug, communication style, beliefs about software, strengths, other AI tools.
  - LinkedIn couldn't be read (sign-in wall). A "Save to PDF" export from James would let it be added to the ledger.
  - Stage 6: `content/james/*.md` is read from disk at runtime, so the chat route needs `outputFileTracingIncludes` (or a build-time import) for Vercel.
- **Issues found:**
  - The public thesis repo imports TensorFlow while James reports PyTorch. The site now states both plainly.
  - LinkedIn (read with James signed in) conflicts with the resume on job titles (SYSDEV, Symph, O&B), the O&B end date (Aug vs Jun 2025), Symph's work mode (remote vs "onsite" in chat), and the React Native certificate date (Jun vs Aug 2026). The site keeps the resume's titles and dates, and Symph's work mode is `null` until James confirms. Details are in the private ledger.
  - James's resume prints `linkedin.com/in/jamesmanonog`, which differs from the URL he supplied. Worth fixing on the resume.
- **Next:** Stage 3 (brand + design system). Stage 4 needs both 2 and 3.

### 2026-09-24: Stage 1: Foundation
- **Done:**
  - Next.js 16.3.6 scaffold (App Router, React 19.2, TS strict plus `noUncheckedIndexedAccess`, Tailwind 4, ESLint 9 flat config) with bun. Placeholder home page with no brand styling and no fonts yet.
  - Prettier with `eslint-config-prettier` and the Tailwind class-sorting plugin.
  - Vitest 5 (Node environment, `@/` alias). Playwright 1.63 with `desktop-chromium` and `mobile-webkit` (iPhone 15) projects, run against a production build on port 3100. One smoke test.
  - `lib/env.ts`: zod 4 schema split into server and public variables, `parseEnv()` with 6 unit tests. It is imported by `next.config.ts`, so `dev` and `build` fail fast on invalid values. `.env.example` documents the upcoming variables.
  - `.github/workflows/ci.yml`: format, lint, typecheck, unit tests and build on PRs and pushes to main.
  - `.nvmrc` (22), `engines.node >=22`, README development section, and `AGENTS.md` (Next's bundled-docs pointer).
- **Checks:** `bun run check` green. `bun run test:e2e` 2/2 passed. A fresh copy of the tracked files passed `bun install --frozen-lockfile && bun run check`, and `bun dev` served the page.
- **Decisions:** see the ARCHITECTURE.md decisions log (Markdown excluded from Prettier, E2E outside `check`, React Compiler off, env validated at config load, project root pinned).
- **Left:** confirm CI on the PR.
- **Issues found:** a stray `~/CODE/package-lock.json` outside the repo made Next warn about the workspace root. Fixed by pinning `turbopack.root` and `outputFileTracingRoot`. The file itself was not touched; James can delete it if it's unused.
- **Next:** Stage 2 (knowledge base; partial answers from James are OK) or Stage 3 (brand + design system). Both depend only on Stage 1.

### 2026-09-24: Stage 0: Audit + research
- **Done:**
  - Private: facts ledger, questions for James and the source audit, in `docs/private/`.
  - Public: design research, architecture, implementation plan, playbook, mascot plan, CLAUDE.md, and the session skills.
  - Repo cloned to `~/CODE/About-Me`, outside iCloud.
- **Decisions:**
  - Greenfield repo.
  - bun as the package manager.
  - Private research kept out of git.
  - Stages reordered so foundation comes before knowledge and the static site comes before AI.
- **Facts updated:** the thesis was a 3-person group project on one shared computer, which explains the single commit author.
- **Left:**
  - James's answers: his own thesis contributions, PyTorch vs TensorFlow, the Chapter 4 results, and the Lylas POS source.
  - Mascot direction and image model.
- **Next:** Stage 1.
