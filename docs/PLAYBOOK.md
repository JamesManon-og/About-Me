# Session Playbook

How to build this project one chat session at a time without losing context. One session
covers one stage **or** one feature, and ends with the repo in a clean, reviewable state.

## The loop

```
/session-start <stage N | feature-name>
      │  Claude reads CLAUDE.md, PROGRESS.md, the stage/feature brief
      │  verifies git state + runs checks, then proposes a plan
      ▼
  you approve / adjust the plan
      ▼
  Claude implements on the branch, running checks as it goes
      ▼
/session-wrap
      │  runs all checks, updates PROGRESS.md (+ plan status),
      │  lists changed files, suggests commit message(s)
      ▼
  you review the diff, commit, push, open PR, merge
      ▼
  next session starts fresh from main
```

The two slash commands live in `.claude/skills/`. If they're unavailable, paste the
**manual kickoff** below instead.

## Session types

| Type | Use for | Brief lives in | Branch |
|---|---|---|---|
| **Stage** | Roadmap work in [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) | the plan | `stage/NN-name` |
| **Feature** | Anything from [BACKLOG.md](BACKLOG.md), or a new idea | `docs/features/<name>.md` (copy `_TEMPLATE.md`) | `feat/<name>` |
| **Fix** | A bug, or review feedback on a merged stage | a short description in the kickoff | `fix/<name>` |
| **Content** | Updating facts about James (new job, new project) | the private ledger, then `data/` + `content/` | `content/<name>` |

## Rules for every session

1. **Start from `main`, up to date.** Claude checks this. You do the pulling and branching if you prefer.
2. **One stage or feature per session.** If scope grows, write the extra into BACKLOG.md; don't do it now.
3. **Plan first, then code.** Claude proposes the plan and waits for your approval before editing.
4. **Truth rule.** Nothing about James goes into the site unless it's in `docs/private/FACTS_LEDGER.md` as Verified or confirmed by you.
5. **Checks must pass** before the wrap: `bun run check` (lint, typecheck, test, build) plus stage-specific checks.
6. **You own git.** Claude never commits or pushes and never adds co-author or "Generated with" lines. Commit format: `Add: [OX] <summary>` (or `Fix:` / `Update:`).
7. **Leave a trail.** PROGRESS.md gets updated at every wrap, even for a half-finished session, recording what's left and why.
8. **Secrets.** You put keys in `.env.local` yourself. Never paste keys into chat.

## Manual kickoff (copy into a fresh chat)

```
We're working on the About-Me repo (~/CODE/About-Me), an AI-powered portfolio about me.
Session: <Stage N — name | Feature: name | Fix: description>

Before doing anything:
1. Read CLAUDE.md, docs/PLAYBOOK.md, docs/PROGRESS.md, and the brief for this session
   (docs/IMPLEMENTATION_PLAN.md section, or docs/features/<name>.md).
2. Check git status/branch and run the existing checks. Tell me the current state and
   anything that doesn't match PROGRESS.md.
3. Propose a short plan (files, steps, how we'll verify). Wait for my OK.
Then implement. Finish with the wrap steps in docs/PLAYBOOK.md. Don't commit; I'll do it.
```

## Manual wrap (if `/session-wrap` isn't available)

```
Wrap the session: run bun run check (+ stage-specific checks), update docs/PROGRESS.md
(done / left / issues / next), tick the stage in IMPLEMENTATION_PLAN.md if complete,
then list changed files and suggest commit message(s) in "Add: [OX] …" format.
```

## Definition of done (every session)

- [ ] The brief's "Done when" criteria are met, or the gaps are recorded in PROGRESS.md
- [ ] `bun run check` is green (from Stage 1 onward)
- [ ] No new facts about James without a ledger source
- [ ] Every UI change works on mobile width and by keyboard, and respects reduced motion
- [ ] PROGRESS.md is updated

## When something goes wrong

- **Checks were already failing at session start.** Fix those first as a `fix/` session. Don't build on red.
- **The session ran out of context or usage.** Start a new chat with the manual kickoff. PROGRESS.md plus `git diff` is enough to resume.
- **The plan turns out wrong mid-stage.** Stop, update the plan section with the reason, then continue.
- **A stage is too big.** Split it into `Na` / `Nb` in the plan and wrap after `Na`.
- **Git operations hang.** Check whether iCloud has crept back (`ps aux | grep fileproviderd`). This repo must stay under `~/CODE`.
