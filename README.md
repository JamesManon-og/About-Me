# About-Me

A chatbot that answers questions about James Manon-og: his projects, experience and way of
working. It answers only from documented facts and says so when it doesn't know.

Status: knowledge base and design tokens in place; the chat is next (Stage 4). See
[docs/PROGRESS.md](docs/PROGRESS.md).

## Development

Requires Node 22+ (see `.nvmrc`) and bun.

```bash
bun install
bun dev
```

| Script | What it runs |
|---|---|
| `bun run check` | Format check, lint, typecheck, unit tests, production build (the CI gates) |
| `bun run test` | Vitest unit tests |
| `bun run test:e2e` | Playwright against a production build (desktop Chromium, mobile WebKit). First run: `bunx playwright install chromium webkit` |
| `bun run format` | Prettier |

Environment variables are validated in `lib/env.ts`. Copy `.env.example` to `.env.local` when a stage needs one.

## Docs

- [Implementation plan](docs/IMPLEMENTATION_PLAN.md): staged roadmap
- [Playbook](docs/PLAYBOOK.md): how each build session runs
- [Architecture](docs/ARCHITECTURE.md)
- [Design research](docs/DESIGN_RESEARCH.md)
- [Backlog](docs/BACKLOG.md)

## Stack (planned)

Next.js 16 · React 19 · TypeScript · Tailwind CSS 4 · Vercel AI SDK 7 · Claude · Vitest · Playwright · Vercel
