---
name: session-start
description: Start a stage, feature, fix or content session on the About-Me portfolio. Reads the project docs, verifies repo state against PROGRESS.md, and proposes a plan for approval before any edits. Use when James types /session-start or says he's starting a new stage or feature.
---

# Session start

Argument: `stage <N>` | `<feature-name>` | `fix <description>` | `content <description>`.
If no argument is given, use the "Current stage" from `docs/PROGRESS.md` and confirm it.

## Steps

1. **Read context** (no edits yet):
   - `CLAUDE.md`, `docs/PLAYBOOK.md`, `docs/PROGRESS.md`, `docs/ARCHITECTURE.md`
   - The brief: the matching section of `docs/IMPLEMENTATION_PLAN.md`, or `docs/features/<name>.md`. If a feature has no brief, offer to write one from `docs/features/_TEMPLATE.md` first.
   - For anything touching facts about James: `docs/private/FACTS_LEDGER.md`. If `docs/private/` is missing (fresh clone), stop and tell James: the ledger is local-only and must be restored before content work.
2. **Verify state:**
   - `git status`, current branch, and whether `main` is behind `origin/main` (`git fetch` is fine; do not pull or switch branches without asking).
   - If `package.json` exists: run `bun run check`, or the individual lint, typecheck, test and build scripts. Report failures; don't fix them yet.
   - Compare what you find with PROGRESS.md and the plan's "Depends on". Flag any mismatch (e.g. a previous stage marked done but its files are missing).
3. **Propose the plan**, short:
   - Goal (one line) and the brief's "Done when" criteria
   - Files to create or change
   - Steps in order, each with how it will be verified
   - Risks, open questions, and anything needing James (keys, facts, design choices)
   - Suggested branch name per PLAYBOOK.md
4. **Wait for James's approval.** Do not edit files before he says go. If he adjusts the plan, restate the final version in one short list, then proceed.

## While implementing

- Stay inside the brief's scope. New ideas go into `docs/BACKLOG.md`, not into this session.
- Run the relevant checks after each meaningful step, not only at the end.
- Never commit, push, or add `Co-Authored-By` / "Generated with" lines. James owns git.
- When done or when the session must stop, use the `session-wrap` skill.
