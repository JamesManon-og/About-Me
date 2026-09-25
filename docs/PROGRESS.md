# Progress

Updated at the end of every session. Newest entry first. This file plus `git log` is the
hand-off between sessions.

## Current state

| | |
|---|---|
| Current stage | **Stage 4: Chat MVP** (next) |
| Last completed | Re-plan to chat-first (2026-09-26). Stage 3 before that |
| Blocked on James | `ANTHROPIC_API_KEY` in `.env.local` before Stage 4 can be tested. Knowledge gaps: `bun run knowledge:gaps` (Track C). Stage 3b needs a mascot direction + image model (optional) |
| Known issues | None |

## Stage checklist

Re-planned 2026-09-26. Old stages 4–15 were replaced; see IMPLEMENTATION_PLAN.md.

- [x] 0 Audit + research
- [x] 1 Foundation
- [x] 2 Knowledge base
- [x] 3 Brand + design system (palette replaced in Stage 4)
- [ ] 3b Mascot (optional)
- [ ] 4 Chat MVP
- [ ] 5 Evals v1
- [ ] 6 Rich answers
- [ ] 7 Security + abuse protection
- [ ] 8 Polish: motion, accessibility, responsive
- [ ] 9 SEO + sharing
- [ ] 10 Hardening, deployment, final QA
- [ ] C Content: knowledge gaps (ongoing)

## Log

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
