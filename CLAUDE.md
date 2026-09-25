# CLAUDE.md: About-Me (James Manon-og AI portfolio)

## Purpose
A chatbot that answers questions about James, grounded in his real work. The chat is the
product: the site opens on a single question and an input, like ChatGPT's empty state, and
there are no portfolio pages (re-planned 2026-09-26). The look is close to ChatGPT:
near-black, neutral sans, white and greys.

## How work happens here
One stage or feature per chat session. Start with `/session-start`, end with
`/session-wrap`. The full process is in `docs/PLAYBOOK.md`.

| Doc | What it is |
|---|---|
| `docs/PROGRESS.md` | Where we are. Read it first, every session |
| `docs/IMPLEMENTATION_PLAN.md` | The staged roadmap and each stage's "Done when" |
| `docs/ARCHITECTURE.md` | Target architecture and the decisions log |
| `docs/DESIGN_RESEARCH.md` | UX, typography, motion and accessibility principles |
| `docs/BACKLOG.md`, `docs/features/` | Feature ideas and briefs |
| `docs/MASCOT.md` | Angel mascot plan (uses the global `ip-as-logo` skill) |
| `docs/private/` | **Local only, gitignored.** Facts ledger, questions for James, source audit |

## James knowledge rules (non-negotiable)
- `docs/private/FACTS_LEDGER.md` is the only source of truth. Publish only rows that are Verified or confirmed by James. Brief-only and Conflict rows are never stated as fact.
- Never publish his phone number, private repos, client or take-home work, business details of his ventures, or teammates' names without consent.
- No invented metrics, employers, clients, technologies, opinions or feelings. "Reported 645,000+ educators" stays attributed to the platform. The thesis is a 3-person group project; say "the team" unless James's own part is documented.
- The assistant speaks about James; it never claims to *be* James. Unknown means saying "I don't have that information."
- This repo is **public**. Nothing from `docs/private/` may be copied verbatim into tracked files.

## Engineering standards
- Next.js 16 App Router, React 19, TypeScript strict, Tailwind 4, `motion` only, AI SDK 7 (Node 22+), zod 4, bun.
- Next 16 docs ship in `node_modules/next/dist/docs/` (see `AGENTS.md`). Read the relevant guide before using a Next API.
- Server Components by default. Client components only for interaction.
- Agent tools are read-only and return `{ data, sources }`. No tool writes, fetches arbitrary URLs or executes code.
- Every visual effect respects `prefers-reduced-motion` and the device tier.
- Accessibility: semantic HTML, visible focus, completed-message announcements (never a streaming live region).
- New dependencies need a one-line justification in the session plan.

## Git
James commits, pushes and opens PRs. Claude never commits or pushes, and never adds
`Co-Authored-By` or "Generated with Claude Code" lines. Suggested messages use the form
`Add: [OX] …`. Shell commands shown to James go one per fenced block with no inline `#` comments.

## Environment
The repo lives at `~/CODE/About-Me`. Never move it under `~/Documents` or `~/Desktop`
(iCloud sync previously broke git and builds). Secrets go only in `.env.local`, set by James.

## Tone
Professional, no emojis, no hype, in docs, UI copy and assistant answers alike.
