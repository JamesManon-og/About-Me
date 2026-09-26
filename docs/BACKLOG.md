# Feature Backlog

Features that aren't a roadmap stage. Pick one per feature session: copy
`docs/features/_TEMPLATE.md` to `docs/features/<name>.md`, fill it in, then run
`/session-start <name>`.

Status: `idea` → `ready` (brief written) → `in progress` → `done`.

| Feature | Why | Earliest after | Status |
|---|---|---|---|
| `random-fact`: "Tell me something unexpected" button | Personality in one click | Stage 5 + James's facts | idea |
| `share-answer`: copy/share a single answer as a link or image | Visitors pass the site along | Stage 6 | idea |
| `ask-deeplink`: `?ask=` prefilled question links | Sharing and recruiter outreach | now part of Stage 9 | planned |
| `architecture-sketch`: MoneyApp migration diagram, as a card the chat can show | Shows systems thinking visually | Stage 6 | idea |
| `ai-workflow-artifacts`: real, redacted context capsule + audit test counts, as a chat card | Evidence over claims | Stage 6 | idea |
| `now-update`: what James is learning or building this month, answerable in chat | Keeps the bot current | Track C | idea |
| `easter-egg`: mascot reacts to the Konami code or long idle | Delight | Stage 8 | idea |
| `resume-download`: generated from `data/james` so it never drifts, offered by the chat | One source of truth | Stage 6 | idea |
| `conversation-export`: download the chat as markdown | Recruiters keep notes | Stage 6 | idea |
| `analytics-lite`: privacy-friendly counts of which prompts get asked | Learn what visitors want | Stage 10 | idea |
| `voice-mode`: ask by voice (AI SDK 7 speech), the mic button in the input | Novel. Only if it earns its place | Stage 10 | idea |
| `conversation-persistence`: keep the chat across a reload (sessionStorage) | A reload or back navigation currently loses the conversation | Stage 8 | idea |
| `claude-path-guards`: Upstash rate limits, a runtime output filter and the injection eval set | Required before `ANTHROPIC_API_KEY` is set in production (docs/DEPLOYMENT.md) | Stage 7 | ready |
| `answer-cards`: project cards and a sources footnote attached to FAQ entries | Stage 6 remainder; richer answers without a model | Stage 6 | idea |
| `routing-holdout`: a fresh batch of visitor-style questions to re-measure matching | The current validation batch has been tuned on | Stage 5 | idea |
| `profile-pages`: static, crawlable pages (about, projects) if search traffic turns out to matter | SEO beyond one chat page. Built once in the first Stage 4 attempt and removed | Stage 9 | idea |

Add ideas freely. Keep the "Why" to one line; if you can't write it, the feature probably
isn't needed.
