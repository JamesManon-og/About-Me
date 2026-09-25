# Mascot: angel (ip-as-logo skill)

Skill: `ip-as-logo`, installed globally at `~/.claude/skills/ip-as-logo`
(source https://github.com/s1dashu/ip-as-logo-skill, MIT, reviewed 2026-09-24: markdown only,
no scripts or network calls. The Snyk "Critical Risk" label on skills.sh is most likely
triggered by the instruction asking for an image-model API key, not by any code).

## What the skill does and doesn't do

- It produces **static** square character images. Motion is added by the site (Stage 8): halo bob, blink, a lean toward the chat input while the agent is "thinking". Always respect `prefers-reduced-motion`.
- It requires a top-tier image model: GPT Image 2 (preferred), Nano Banana Pro, or Nano Banana 2. **No SVG fallback** is allowed by the skill.
- Its workflow is: propose three directions, get approval, then generate six candidates (two per direction, one emerging from each lower corner).

## Proposed directions

| | Direction | Semantic colours (2 IP + 1 bg) | Brand link | Best use |
|---|---|---|---|---|
| **A** | **Ink-halo angel.** A round, cream, baby-proportioned body. Its single defining feature is a halo drawn as a hand-inked loop, echoing the handwritten signature in the type system | cream + ink navy / muted terracotta bg | Human signature × engineer | Primary logo, favicon |
| **B** | **Paper-wing angel.** Wings read as two folded sketchbook pages | cream + graphite / muted sage bg | Sketchbook, editorial | Section marks, 404 page |
| **C** | **Bot angel.** A soft rounded robot head with the halo as its antenna | white + warm yellow / muted cobalt bg | AI agent, builder | Chat avatar |

Recommendation: A as the logo, C as the chat avatar, both with the **same two IP colours**
so they read as one family. The palette follows the Stage 4 chat tokens (near-black, white and greys), so the directions' colours will be revisited before generating.

## Where the mascot appears

favicon / app icon · chat avatar (with the typing state animated) · Open Graph image · 404 page · loading state

## Generation checklist (when a model is enabled)

1. Put the key in `.env.local` (gitignored) yourself.
2. Invoke the `ip-as-logo` skill with subject "angel", the product brief from `CLAUDE.md`, and the chosen directions.
3. Save outputs to `public/brand/mascot/candidates/` with labels A1…C2, and record the model and prompt in `docs/MASCOT.md`.
4. James picks a winner. Export 512, 192, 180 and 32 px sizes plus `favicon.ico`.
