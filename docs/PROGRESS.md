# Progress

Updated at the end of every session. Newest entry first. This file plus `git log` is the
hand-off between sessions.

## Current state

| | |
|---|---|
| Current stage | **Stage 3: Brand + design system** (next) |
| Last completed | Stage 2: Knowledge base |
| Blocked on James | Stage 3 needs 5–10 handwritten phrases (or accept the Caveat fallback) and his approval of the direction. Stage 3b needs a mascot direction + image model. Remaining knowledge gaps: `bun run knowledge:gaps` |
| Known issues | None. Stage 1 CI passed on the PR and on `main` |

## Stage checklist

- [x] 0 Audit + research
- [x] 1 Foundation
- [x] 2 Knowledge base
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
