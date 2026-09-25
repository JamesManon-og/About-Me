# Architecture

Target architecture. Stages build toward it. Change it only with a recorded reason in the
Decisions log below.

## Shape

Chat-first (re-planned 2026-09-26). The site is one page: the chat.

```
Browser
  │  the chat page (RSC shell + client chat)   │  POST /api/chat (stream)
  ▼                                            ▼
Next.js 16 on Vercel ─────────────────────────────────────────────
  app/page.tsx           empty state (question + input + suggestions), then the conversation
  app/api/chat/route.ts  guards → streamText(model, system + knowledge context, tools) → UI message stream
  lib/agent/             system prompt, knowledge context, tool definitions, guards, output filter
  lib/knowledge/         loaders, zod schemas, read-only queries
  content/james/*.md     prose knowledge (public-safe, human-edited)
  data/james/*.ts        typed structured facts, every fact carries sources[]
  components/chat/       conversation UI + one renderer per tool result type
────────────────────────────────────────────────────────────────────
        │ Upstash Redis (rate limits)      │ Claude via AI SDK provider / AI Gateway
```

## Stack

| Concern | Choice | Why |
|---|---|---|
| Framework | Next.js 16 App Router, React 19, TypeScript strict | Server-rendered shell with a streaming route. James's primary stack |
| Styling | Tailwind CSS 4 (`@theme` tokens in CSS) | Tokens as CSS variables, which makes theming easy |
| Motion | `motion` only | One library. No GSAP or Lenis unless a stage justifies it |
| AI | AI SDK 7 (`ai`, `@ai-sdk/react`) + Claude provider | Typed tools, `useChat` message parts for generative UI, telemetry. Requires Node 22+ |
| Chat primitives | Own components in `components/chat/` on `useChat`, `react-markdown` for answers | Stage 4 needed a handful of pieces. AI Elements would have brought shadcn, Radix and Streamdown (see the decisions log) |
| Validation | zod 4 | Content schemas and tool inputs |
| Rate limiting | Upstash Redis + `@upstash/ratelimit` | Serverless-friendly |
| Tests | Vitest (unit), Playwright (e2e, a11y via axe), eval runner script | |
| Package manager | bun (single `bun.lock`) | Matches James's other repos |
| Hosting | Vercel, region `sin1` | Close to the primary audience. Same as MoneyApp |

## Knowledge model

- The **source of truth** is `docs/private/FACTS_LEDGER.md` (local only, gitignored). Only public-safe, verified facts are copied into `content/` and `data/`.
- Every structured fact has `sources: SourceId[]`. Unknown fields are `null`, never guessed.
- **Grounding by full context.** The whole public knowledge base (`data/james` plus published and partial `content/james`, never gaps) is about 11K tokens. `lib/agent/knowledge-context.ts` serialises it into the system prompt, cached with Anthropic prompt caching. No vector database and no search index. Revisit only if the corpus outgrows the context or evals show misses.

## Agent tools (all read-only, Stage 6)

Tools exist to render rich answers, not to retrieve text: `listProjects` · `getProject(slug)` ·
`getTimeline` · `getSkills` · `getContact`. They wrap `lib/knowledge/queries.ts`.

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
| 2026-09-24 | `bun run check` = format, lint, typecheck, unit tests, build. E2E runs separately | Fast gate without browsers. Playwright joins CI in Stage 10 (was 11 before the re-plan) |
| 2026-09-24 | React Compiler off | Adds a Babel step with nothing to optimise yet. Revisit in Stage 8 |
| 2026-09-24 | Env validated by importing `lib/env.ts` from `next.config.ts` | `dev` and `build` fail fast on bad values. Next loads `.env*` before the config |
| 2026-09-24 | ESLint 9 (scaffold default), not 10 | `eslint-config-next` plugins not yet confirmed on 10 |
| 2026-09-24 | `turbopack.root` and `outputFileTracingRoot` pinned to the repo | A lockfile in a parent folder was picked up as the workspace root |
| 2026-09-24 | Content Markdown stays out of Prettier. Frontmatter is flat `key: value` lines read by a small parser in `lib/knowledge/content.ts` | Keeps prose as authored. Avoids a YAML/gray-matter dependency for four fields |
| 2026-09-24 | Content files carry `status: published / partial / gap`. Gap files are never loaded for the site or agent | Unknown topics exist as explicit placeholders, so the gap report and the agent's "I don't know" come from one place |
| 2026-09-24 | `KnowledgeSchema` checks cross-references (source ids, project slugs, duplicate ids) at module load | A typo fails the build instead of shipping an unsourced fact |
| 2026-09-24 | Private names in the forbidden-content test are stored as SHA-256 hashes | The repo is public, so a plain-text denylist would leak the names it protects. The plain list is in the private ledger |
| 2026-09-24 | Unknown or deeply personal questions answer "I don't have that information" and point to James's email | James's request. Never a guessed answer |
| 2026-09-25 | Colour tokens declared once with `light-dark()`, re-declared on every `[data-theme]` element | One definition per token. Tailwind's Lightning CSS polyfill resolves `light-dark()` where a token is declared, so forced-theme subtrees need their own declaration |
| 2026-09-25 | `app/globals.css` is the only source for colour values. `lib/design/tokens.ts` parses it for the contrast test and `/design` | No duplicate token table in TypeScript that could drift |
| 2026-09-25 | Primitives are dependency-free Server Components with a small `cx` helper (no `clsx`, `tailwind-merge` or shadcn) | Few variants. Class overrides are not supported by design |
| 2026-09-25 | Handwriting renders in Caveat behind `Handwritten` until James's phrases are vectorised | Swapping in the SVGs changes one component, no call sites |
| 2026-09-25 | `.claude/launch.json` defines the `dev` server for the desktop app's preview pane | Used for visual checks. Not needed for the build |
| 2026-09-26 | Accent is terracotta (`#a8482a` / `#e8906c`). Ochre and slate candidates removed | James approved the default after comparing all three on `/design` |
| 2026-09-26 | **Chat-first re-plan.** The chatbot is the product; no portfolio pages. The static site built in the first Stage 4 attempt was removed before commit | James: the goal is an agent that answers everything about him, not a second copy of a portfolio site |
| 2026-09-26 | Look close to ChatGPT: near-black, neutral sans, white and greys. Replaces the Stage 3 palette and fonts in Stage 4 | James's choice. Token mechanics and the contrast test from Stage 3 are kept |
| 2026-09-26 | The assistant still speaks about James in the third person | James's choice. Answers never become claims in his voice |
| 2026-09-26 | Ground answers with the full knowledge base in a cached system prompt, not a search index | The corpus is about 11K tokens. Full context is simpler and more accurate at this size, and caching keeps it cheap |
| 2026-09-26 | Kept from the first Stage 4 attempt: `lib/knowledge/queries.ts`, `lib/knowledge/format.ts`, and `relatedProjects` on known FAQs | The Stage 6 tools and answer cards need the same lookups and labels |
| 2026-09-26 | AI Elements not used. The chat is built from its own small components on `useChat` | The chat needs a composer, a message list and a Markdown renderer. The registry brings shadcn, Radix and Streamdown for that |
| 2026-09-26 | Answers render with `react-markdown`: raw HTML skipped, only answer elements allowed (others unwrapped to text, so no images), links open in a new tab | Streamdown turns on raw HTML (`rehype-raw`) by default. Answers need lists, emphasis and links only. A new tab keeps the unsaved conversation |
| 2026-09-26 | Rules and knowledge are one system message with an ephemeral cache breakpoint, built once per server instance and byte-stable | About 7K tokens, above Haiku 4.5's 4,096-token cache minimum. Any varying byte would miss the cache on every request |
| 2026-09-26 | Default model `claude-haiku-4-5`. `CHAT_MODEL` overrides it from an allowlist (Haiku 4.5, Sonnet 5, Opus 5); the newer models run at `effort: low` | The plan picks the cheapest model that passes the 15-question smoke test (`bun run smoke:chat`), which waits for James's key |
| 2026-09-26 | `CHAT_MODEL_MOCK=1` swaps Claude for a scripted `MockLanguageModelV4` (`ai/test`). The env schema refuses it when `VERCEL_ENV=production` | e2e drives the real route (validation, streaming, Stop) with no key and no cost, and the UI can be worked on without a key |
| 2026-09-26 | `ANTHROPIC_API_KEY` is optional in the env schema. The route answers 503 without it | Build and CI run without secrets |
| 2026-09-26 | The route passes only text parts to the model, rebuilt as plain `{ role, content }` messages | A forged body cannot add files, tool results or system turns |
| 2026-09-26 | The page scrolls, not an inner panel. Header and composer are sticky | Native scrolling works best for keyboard, screen readers and mobile browser chrome |
| 2026-09-26 | The finished answer is announced once, as plain text, from `useChat`'s `onFinish` through one polite live region. Stop and errors are announced the same way | The streaming node is never a live region (DESIGN_RESEARCH §7) |
| 2026-09-26 | Send and Stop are one button element whose label and action swap | Keyboard focus survives the state change |
| 2026-09-26 | `scan:static` runs after the build in `check` and CI. It fails on an API key pattern, the configured key, or a server-only variable name in `.next/static` | Stage 4 "Done when": no key in the client bundle |
