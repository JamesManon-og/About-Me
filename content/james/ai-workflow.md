---
title: How James works with AI
status: partial
sources: dev-session-notes, jobpilot-repo
missing: Which AI tools James uses regularly, besides Claude Code.
---

These are patterns observed in James's documented development sessions, not claims he has
made about himself.

**Plan first, then check the plan.** Before implementing, he asks the assistant for a
plan, then asks for it to be double-checked, with the pros and cons listed.

**One stage per session.** Larger changes run as numbered stages, each on its own branch
and pull request. MoneyApp's mobile migration was built this way.

**Context capsules.** He writes a short block of verified repository facts, such as the
package manager, the workspace layout and stale lockfiles to ignore, and pastes it into
each new session, so the work starts from checked facts rather than memory.

**Audit before fixing.** JobPilot's expansion began with a reliability audit, where each
bug was reproduced with a failing test before it was fixed.

**The human stays accountable.** He keeps commits and pushes to himself. JobPilot follows
the same rule: it prepares applications, but a person clicks submit.

**Asking why.** He asks for the reasoning behind his own stack, not only instructions,
for example why NestJS rather than serverless functions, and why Prisma and Supabase.

The AI tool documented in his work is Claude Code.
