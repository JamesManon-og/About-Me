---
name: session-wrap
description: Close out a session on the About-Me portfolio. Runs all checks, updates PROGRESS.md and the plan's status, and hands James a changed-files list plus suggested commit messages without committing. Use when James types /session-wrap or says the stage or feature is done or the session is ending.
---

# Session wrap

## Steps

1. **Run the checks:** `bun run check` (or lint, typecheck, test and build separately) plus any stage-specific checks named in the brief (e2e, evals, Lighthouse, axe). Capture the real results. If something fails, say so plainly. Don't mark the stage done.
2. **Review the diff:** `git status` and `git diff --stat`. Re-read changed files for leftovers: debug logs, TODOs without backlog entries, secrets, and facts about James not in the ledger.
3. **Update `docs/PROGRESS.md`:**
   - "Current state" table: current stage, last completed, blockers, known issues
   - Tick the stage checklist if its "Done when" criteria are all met
   - New log entry at the top: date, session name, **Done**, **Decisions**, **Left**, **Issues found**, **Next**
4. **Update other docs if they changed:** the ARCHITECTURE.md decisions log, and the BACKLOG.md status for features.
5. **Hand-off to James**, in this format:
   - Result: done / partially done (what's left)
   - Check results (actual output summary)
   - Changed files, grouped by purpose
   - Suggested commits, one per logical group, format `Add: [OX] <summary>` / `Fix: [OX] …` / `Update: [OX] …`, with no co-author or "Generated with" lines
   - Branch name, and the one command set to commit and push it, in separate ```bash blocks with no inline `#` comments (James's zsh doesn't allow them)
   - What the next session should be

Never run `git commit` or `git push` yourself.
