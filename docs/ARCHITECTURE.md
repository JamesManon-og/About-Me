# Architecture

Target architecture. Stages build toward it. Change it only with a recorded reason in the
Decisions log below.

## Shape

```
Browser
  │  static HTML (RSC)                 │  POST /api/chat (stream)
  ▼                                    ▼
Next.js 16 on Vercel ─────────────────────────────────────────────
  app/(site)/            pages built from data/james (SEO-complete, no AI needed)
  app/api/chat/route.ts  guards → streamText(model, system, tools) → UI message stream
  lib/agent/             system prompt, tool definitions, guards, output filter
  lib/knowledge/         loaders, zod schemas, in-memory search index
  content/james/*.md     prose knowledge (public-safe, human-edited)
  data/james/*.ts        typed structured facts, every fact carries sources[]
  components/chat/       conversation UI + one renderer per tool result type
────────────────────────────────────────────────────────────────────
        │ Upstash Redis (rate limits)      │ Claude via AI SDK provider / AI Gateway
```

## Stack

| Concern | Choice | Why |
|---|---|---|
| Framework | Next.js 16 App Router, React 19, TypeScript strict | Static-first with streaming routes. James's primary stack |
| Styling | Tailwind CSS 4 (`@theme` tokens in CSS) | Tokens as CSS variables, which makes theming easy |
| Motion | `motion` only | One library. No GSAP or Lenis unless a stage justifies it |
| AI | AI SDK 7 (`ai`, `@ai-sdk/react`) + Claude provider | Typed tools, `useChat` message parts for generative UI, telemetry. Requires Node 22+ |
| Chat primitives | AI Elements (shadcn registry) as a starting point, restyled | Saves plumbing (scroll, streaming, tool states). Its stock look is not the brand |
| Validation | zod 4 | Content schemas and tool inputs |
| Rate limiting | Upstash Redis + `@upstash/ratelimit` | Serverless-friendly |
| Tests | Vitest (unit), Playwright (e2e, a11y via axe), eval runner script | |
| Package manager | bun (single `bun.lock`) | Matches James's other repos |
| Hosting | Vercel, region `sin1` | Close to the primary audience. Same as MoneyApp |

## Knowledge model

- The **source of truth** is `docs/private/FACTS_LEDGER.md` (local only, gitignored). Only public-safe, verified facts are copied into `content/` and `data/`.
- Every structured fact has `sources: SourceId[]`. Unknown fields are `null`, never guessed.
- No vector database. The corpus is small. `searchKnowledge` uses an in-memory keyword/BM25 index built at module load. Revisit only if evals show retrieval misses.

## Agent tools (all read-only)

`getProfile` · `listProjects` · `getProject(slug)` · `getExperience` · `getLeadership` ·
`getSkills` · `getAIWorkflow` · `getTimeline` · `searchKnowledge(query)` · `getContact`

Each returns `{ data, sources }`. There are no write, fetch or exec tools, ever.

## Guards (request path order)

1. Rate limit per IP, plus a global daily cap
2. Validate the body: at most 1,000 characters per message, keep the last 20 messages, reject empty input
3. `streamText` with at most 5 steps, a max output token cap and a timeout
4. Output filter: blocks phone numbers and email addresses unless they come from `getContact`
5. Markdown rendered without raw HTML. Links are restricted to an allowlist from `data/james/links.ts`

## Decisions log

| Date | Decision | Reason |
|---|---|---|
| 2026-09-24 | Greenfield repo `About-Me`; old portfolio not reused | James's call |
| 2026-09-24 | Repo lives in `~/CODE/About-Me`, not `~/Documents` | iCloud sync broke git and builds before |
| 2026-09-24 | Private research kept in gitignored `docs/private/` | The repo is public |
| 2026-09-24 | No AI SDK RSC (`streamUI`) | Its development is paused. Use `useChat` tool parts |
| 2026-09-24 | Markdown excluded from Prettier | Keeps hand-written docs as authored. Revisit for `content/` in Stage 2 |
| 2026-09-24 | `bun run check` = format, lint, typecheck, unit tests, build. E2E runs separately | Fast gate without browsers. Playwright joins CI in Stage 11 |
| 2026-09-24 | React Compiler off | Adds a Babel step with nothing to optimise yet. Revisit in Stage 8 |
| 2026-09-24 | Env validated by importing `lib/env.ts` from `next.config.ts` | `dev` and `build` fail fast on bad values. Next loads `.env*` before the config |
| 2026-09-24 | ESLint 9 (scaffold default), not 10 | `eslint-config-next` plugins not yet confirmed on 10 |
| 2026-09-24 | `turbopack.root` and `outputFileTracingRoot` pinned to the repo | A lockfile in a parent folder was picked up as the workspace root |
| 2026-09-24 | Content Markdown stays out of Prettier. Frontmatter is flat `key: value` lines read by a small parser in `lib/knowledge/content.ts` | Keeps prose as authored. Avoids a YAML/gray-matter dependency for four fields |
| 2026-09-24 | Content files carry `status: published / partial / gap`. Gap files are never loaded for the site or agent | Unknown topics exist as explicit placeholders, so the gap report and the agent's "I don't know" come from one place |
| 2026-09-24 | `KnowledgeSchema` checks cross-references (source ids, project slugs, duplicate ids) at module load | A typo fails the build instead of shipping an unsourced fact |
| 2026-09-24 | Private names in the forbidden-content test are stored as SHA-256 hashes | The repo is public, so a plain-text denylist would leak the names it protects. The plain list is in the private ledger |
| 2026-09-24 | Unknown or deeply personal questions answer "I don't have that information" and point to James's email | James's request. Never a guessed answer |
