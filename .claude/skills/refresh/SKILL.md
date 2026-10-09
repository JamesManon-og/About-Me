---
name: refresh
description: Read-only catch-up on the About-Me repo. Summarises where the project stands, what changed, what is new, health of checks and what could improve, as brief bullets readable at a glance. Use when James types /refresh or asks to be caught up on the project.
---

# Refresh

Read-only. Never edit files, commit, pull, push or switch branches. `git fetch` is fine.

## Steps

1. **Read docs:** `docs/PROGRESS.md`, the current stage's section of `docs/IMPLEMENTATION_PLAN.md`, `docs/BACKLOG.md`. Skim `docs/features/` for briefs not yet started.
2. **Git state:**
   - Current branch and `git status --short`
   - `git log --oneline -10`
   - `git fetch`, then ahead/behind of `main` vs `origin/main`
   - `git diff --stat main...HEAD` if not on `main`
3. **Health:** run `bun run check` (or lint and typecheck if `check` is missing). Report pass or fail per step only, no logs.
4. **Scan:** `TODO|FIXME|HACK` in source files; anything PROGRESS.md claims that the repo contradicts.

## Output

Bullets only, one line each, about 25 bullets max, no prose, no emojis. Use exactly these headings:

**Where we are**
- Stage, branch, clean or dirty, ahead/behind origin

**Changed recently**
- Notable recent commits and uncommitted files

**New**
- Things added since PROGRESS.md was last updated

**Health**
- Each check: pass or fail (with the one-line reason if fail)

**Could improve**
- 3 to 5 concrete, specific suggestions (file or area named)

**Next step**
- One bullet, e.g. `/session-start <stage or feature>`

## Rules
- Never quote or paraphrase content from `docs/private/`; at most say it exists or is missing.
- If nothing changed in a section, write a single "- None" bullet.
