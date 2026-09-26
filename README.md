# About-Me

A chatbot that answers questions about James Manon-og: his projects, experience and way of
working. It answers only from documented facts and says so when it doesn't know.

Answers come from a prebuilt set James has approved (`data/james/faq.ts`), matched to the
visitor's question without any model, so the site needs no API key and costs nothing to
run. Claude answers the questions the set doesn't cover only if a key is set.

Status: ready to deploy. See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) and
[docs/PROGRESS.md](docs/PROGRESS.md).

## Development

Requires Node 22+ (see `.nvmrc`) and bun.

```bash
bun install
bun dev
```

No environment variables are needed. Without a key, questions the answer set doesn't cover
get the fixed unknown reply and the closest questions. `CHAT_MODEL_MOCK=1 bun dev` sends
those questions to a scripted mock model instead, for working on the streaming UI.

| Script | What it runs |
|---|---|
| `bun run check` | Format check, lint, typecheck, unit tests, production build, and a scan of the client files for secrets (the CI gates) |
| `bun run test` | Vitest unit tests |
| `bun run test:e2e` | Playwright against a production build with the mock model (desktop Chromium, mobile WebKit), including axe accessibility checks. First run: `bunx playwright install chromium webkit` |
| `bun run eval` | The eval set (`evals/cases.ts`) end to end through the chat route. Free without a key; see [Evals](#evals) |
| `bun run knowledge:gaps` | What the knowledge base still doesn't know |
| `bun run format` | Prettier |

Environment variables are validated in `lib/env.ts` and documented in `.env.example`.

## Evals

`bun run eval` asks the chat 97 questions and grades each answer. It is free without a key.

- **Every answer** must pass the same rules: no phone numbers, no email address but the
  public one, no private names, no links outside the allowlist, never claiming to be
  James, no emoji.
- **Prebuilt answers and the fallback** must also be one the case accepts. Each case lists
  its acceptable answers, and whether "I don't have that information" is acceptable too.
- **Answers Claude writes** (only with a key) also go to a judge model (Claude Opus 5),
  which checks them against a reference answer or a criterion and against the knowledge.
- **Pass mark:** 90% of fact cases and 100% of the unknown, privacy, false-premise and
  identity cases.

The same routing check runs as a unit test in `bun run check`, so a new answer or synonym
can't silently break matching.

```bash
bun run eval
```

- By default the route handler runs in-process, so no server is needed.
- `--url https://your-site/api/chat` tests a running server or a deployment.
- `--kind`, `--case` and `--runs` narrow or repeat the run.
- With a key, `--calibrate` checks the judge on known-good and known-bad answers first.
  Judged runs cost a little and print their cost.
- A timeout or API error counts as an error, never as a fail, and marks the run incomplete.
- Results are written to `evals/results/` (gitignored) as JSON and a readable Markdown report.

## Docs

- [Deployment](docs/DEPLOYMENT.md): putting the site live and keeping it updated
- [Implementation plan](docs/IMPLEMENTATION_PLAN.md): staged roadmap
- [Playbook](docs/PLAYBOOK.md): how each build session runs
- [Architecture](docs/ARCHITECTURE.md)
- [Design research](docs/DESIGN_RESEARCH.md)
- [Backlog](docs/BACKLOG.md)

## Stack

Next.js 16 · React 19 · TypeScript · Tailwind CSS 4 · Vercel AI SDK 7 · Claude · Vitest · Playwright · Vercel
