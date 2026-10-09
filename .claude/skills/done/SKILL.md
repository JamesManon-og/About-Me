---
name: done
description: Hand James a copy-paste git routine for the work in this session - a branch named from the context, grouped commits in the repo's usual format, push, and PR. Claude never runs these itself. Use when James types /done or says he's ready to commit.
---

# Done

Claude prepares the commands; James runs them. Never run `git checkout -b`, `git add`, `git commit` or `git push` yourself. Read-only git commands (`status`, `diff`, `log`, `branch`) are fine.

## Steps

1. **Look at the changes:** `git status --short`, `git diff --stat`, current branch, `git log --oneline -5`. If nothing changed, say so and stop.
2. **Quick check:** run `bun run check` (or lint and typecheck). If anything fails, report it in one line and ask whether to continue.
3. **Scan the diff** for leftovers: debug logs, secrets, anything from `docs/private/`. Flag them before giving commands.
4. **Branch:**
   - If on `main`, propose a new branch named from the work, using the existing prefixes: `stage/NN-<name>`, `feature/<name>`, `fix/<name>`, `docs/<name>`, `replan/<name>`. Kebab-case, short.
   - If already on a work branch that fits, keep it and say so.
5. **Group the commits** by logical purpose (one feature, one fix, docs separately). Messages follow the repo format exactly:
   - `Add: [OX] <summary>` for new things
   - `Fix: [OX] <summary>` for fixes
   - `Update: [OX] <summary>` for changes, docs, progress
   - Lowercase after the tag, no trailing period, no co-author or "Generated with" lines.

## Output

Brief bullets first:
- Branch: name (new or existing)
- Checks: pass / fail
- Commits: count, one line each

Then the commands, **one command per fenced ```bash block**, no inline `#` comments (James's zsh rejects them), in order:

1. `git checkout -b <branch>` (only if a new branch)
2. For each commit group: `git add <explicit paths>` then `git commit -m "<message>"` as separate blocks. Never `git add .` or `-A`.
3. `git push -u origin <branch>`
4. `gh pr create --base main --title "<title>" --body "<one or two lines>"`

End with one line: what to do after merge (e.g. `/refresh` next session).
