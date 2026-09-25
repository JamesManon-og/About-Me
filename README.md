# About-Me

A chatbot that answers questions about James Manon-og: his projects, experience and way of
working. It answers only from documented facts and says so when it doesn't know.

Status: the chat works end to end (Stage 4); the model choice waits on a live smoke test.
See [docs/PROGRESS.md](docs/PROGRESS.md).

## Development

Requires Node 22+ (see `.nvmrc`) and bun.

```bash
bun install
bun dev
```

The chat needs `ANTHROPIC_API_KEY` in `.env.local` (copy `.env.example`). Without a key,
`CHAT_MODEL_MOCK=1 bun dev` answers every question with a fixed mock reply, which is
enough for UI work.

| Script | What it runs |
|---|---|
| `bun run check` | Format check, lint, typecheck, unit tests, production build, and a scan of the client files for secrets (the CI gates) |
| `bun run test` | Vitest unit tests |
| `bun run test:e2e` | Playwright against a production build with the mock model (desktop Chromium, mobile WebKit). First run: `bunx playwright install chromium webkit` |
| `bun run smoke:chat` | 15 live questions against a running `bun dev`. Calls the real model, so it costs a little |
| `bun run knowledge:gaps` | What the knowledge base still doesn't know |
| `bun run format` | Prettier |

Environment variables are validated in `lib/env.ts` and documented in `.env.example`.

## Docs

- [Implementation plan](docs/IMPLEMENTATION_PLAN.md): staged roadmap
- [Playbook](docs/PLAYBOOK.md): how each build session runs
- [Architecture](docs/ARCHITECTURE.md)
- [Design research](docs/DESIGN_RESEARCH.md)
- [Backlog](docs/BACKLOG.md)

## Stack (planned)

Next.js 16 · React 19 · TypeScript · Tailwind CSS 4 · Vercel AI SDK 7 · Claude · Vitest · Playwright · Vercel
