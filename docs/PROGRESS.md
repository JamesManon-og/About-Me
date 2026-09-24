# Progress

Updated at the end of every session. Newest entry first. This file plus `git log` is the
hand-off between sessions.

## Current state

| | |
|---|---|
| Current stage | **Stage 2: Knowledge base** (next; Stage 3 can also start) |
| Last completed | Stage 1: Foundation |
| Blocked on James | Stage 2 needs answers in `docs/private/QUESTIONS_FOR_JAMES.md` (partial is OK). Stage 3b needs a mascot direction + image model |
| Known issues | CI has not run yet. Confirm it goes green on the Stage 1 PR |

## Stage checklist

- [x] 0 Audit + research
- [x] 1 Foundation
- [ ] 2 Knowledge base
- [ ] 3 Brand + design system
- [ ] 3b Mascot
- [ ] 4 Static site
- [ ] 5 Agent foundation
- [ ] 6 Knowledge tools + eval v1
- [ ] 7 Generative UI
- [ ] 8 Motion + interaction
- [ ] 9 Accessibility + responsive
- [ ] 10 Security + abuse protection
- [ ] 11 Testing + AI evaluation
- [ ] 12 SEO + metadata
- [ ] 13 Production hardening
- [ ] 14 Vercel deployment
- [ ] 15 Final QA

## Log

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
