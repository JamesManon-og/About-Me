# Design Research

Stage 0 research, September 2026. Principles are extracted from sources, not copied.

## 1. Platform facts (checked against npm on 2026-09-24)

| Package | Latest | Implication |
|---|---|---|
| `next` | 16.3.6 | App Router, Instant Navigations (16.3). A security release (16.3.7) is scheduled for 2026-09-30, so pin after it lands |
| `react` | 19.3.0 | Server Components by default. Keep client islands small |
| `ai` | 7.0.x | AI SDK 7 needs **Node 22+**. It adds typed tool context, tool approvals, timeouts and redesigned telemetry. AI SDK RSC (`streamUI`) development is paused, so do **not** build on it |
| `@ai-sdk/react` | 4.0.x | `useChat` with typed message parts. Tool parts render as React components; this is the generative-UI path |
| `@ai-sdk/anthropic` / `@ai-sdk/gateway` | 4.0.x | Provider-agnostic. The gateway allows model switching and spend limits on Vercel |
| `tailwindcss` | 4.3.x | CSS-first config (`@theme`). Tokens live in CSS variables |
| `motion` | 13.4.x | One animation library (the successor to framer-motion). No GSAP or Lenis unless justified |
| `zod` | 4.6.x | Tool input schemas, and validation of content data |
| `@playwright/test` | 1.63.x | E2E and visual regression |
| AI Elements | registry | shadcn-based chat primitives (Conversation, Message, Tool, Reasoning). shadcn/ui also shipped chat primitives (MessageScroller) in June 2026. Use them as a **base** and restyle heavily; the stock look is generic |

## 2. AI-native portfolio: patterns worth adopting

1. **Two layers, one truth.** The static site is complete and crawlable without the agent. The agent is a second way into the *same* content. Seen in good 2026 examples; the weak ones replace the site with a chat box and lose SEO and skimmability.
2. **Suggested prompts as invitations.** Show 4–6 topic chips ("James as an engineer", "Projects", "AI workflow", "How he handles messy code"). Clicking one sends a natural question. Rotate one "curious" prompt ("Tell me something unexpected").
3. **Tool calls produce components, not paragraphs.** `getProject` returns a project story card, `getTimeline` a timeline, `getSkills` a grouped stack. Text answers stay short and frame the component.
4. **Show provenance.** Every fact-bearing answer can show "Sources: Resume · MoneyApp README". This builds trust and makes hallucination visible.
5. **Honest framing.** Use "An AI assistant that knows James's work", never "I am James". Answer in the third person, or as a clearly labelled assistant.
6. **Follow-up chips** after each answer (2–3, derived from the tool used).
7. **Deep links.** `/projects/moneyapp` as a static page, with the agent linking to it; `?ask=` pre-fills a question for sharing.
8. **Protection layers**, as seen in public write-ups of portfolio chatbots: rate limit, input length cap, grounded retrieval, an output filter for contact data, and a daily spend cap.

## 3. Patterns to avoid

- The chat bubble in the corner "bolted on" to a template. It is the most common and the least memorable.
- Purple/neon AI gradients, glassmorphism stacks, particle backgrounds, and "hero with 3D blob".
- Walls of streamed text. Unbounded multi-paragraph answers.
- Scroll-jacking (Lenis-style smooth scroll everywhere) on content pages. It hurts mobile and accessibility.
- Animating everything on entrance. Reserve motion for hierarchy and for feedback.
- Skill bars and percentages ("React 90%"). They are meaningless and read as junior.
- A card grid for every section.

## 4. Visual direction: "sketchbook meets engineering lab"

The brief's metaphor fits James's evidence: he plans on paper-like docs (context capsules,
staged plans), then builds rigorous systems. Proposed treatment:

- **Paper** (warm off-white) and **ink** (near-black navy) as the base. One accent, shared with the mascot. A dark mode is "ink" paper with chalk-like text, not inverted neon.
- **Grid** visible only faintly (engineering paper), used as structure in project architecture diagrams.
- **Annotations** as the human layer: margin notes, arrows, underlines, circled words. These are SVG strokes animated with `pathLength` once per view, never looping.
- **Architecture sketches** for projects. For example, MoneyApp's NestJS to route-handler migration drawn as a diagram that "draws itself" (a stroke-dash reveal) on scroll into view.
- Texture: optional, low-contrast SVG noise at ≤3% opacity, disabled on low-power devices. (The previous portfolio's memory notes show that paper textures and blend modes caused lag on real devices; learn from that.)

## 5. Typography directions

Three roles: editorial serif (voice) · grotesk sans (UI, body) · handwritten (signature only).

| Option | Serif | Sans | Hand | Character |
|---|---|---|---|---|
| **1 (recommended)** | Instrument Serif (italic for emphasis) | Instrument Sans / Geist | **James's own handwriting** as SVG paths for 5–10 key phrases | Most authentic. The superfamily pairing is pre-harmonised. Real handwriting cannot be faked by a template |
| 2 | Fraunces (soft, variable) | Inter Tight | Caveat | Warmer, more playful |
| 3 | Newsreader | Geist | Kalam | Quieter, more literary |

Rules: the handwritten face never exceeds about 5% of the text on screen. It is never used for
body copy, and never for anything that must be read to operate the UI. Load fonts with
`next/font` using only the weights you use.

## 6. Motion principles

1. Motion explains: entrance order equals reading order; a tool call shows an indicator ("looking up MoneyApp…"); the timeline progresses with scroll.
2. One signature moment per view at most (the hero signature draws once).
3. Durations of 150–250 ms for UI and 400–700 ms for editorial reveals. Use spring or ease-out, and no bounce on text.
4. `prefers-reduced-motion`: disable transforms and path draws and render the final state. Also provide an in-site "reduce motion" toggle (WCAG 2.3.3).
5. Device tiering: gate texture and large effects behind a capability check, reusing the idea proven in the old portfolio.

## 7. Chat UX and accessibility

- **Streaming vs screen readers.** Do not put `aria-live` on the streaming node; token-level updates stutter. Stream silently into a visual region, then announce the **completed** message once through a separate polite live region.
- The input is a real `<form>` with a `<label>`. Enter sends and Shift+Enter adds a newline. It shows its disabled state while streaming, and has a visible Stop button.
- Suggested prompts are `<button>`s in a labelled group, in keyboard order, with focus rings visible on paper and ink themes.
- Generated components use semantic HTML (lists, headings, `<time>`), not divs.
- Errors are human: "The assistant is resting (rate limit). Here's the static project page instead."
- Mobile: the input is pinned above the keyboard (`interactive-widget=resizes-content`), with 44 px targets and no hover-only affordances.

## 8. Information architecture (proposal)

One long home page with anchored sections, plus static detail pages:

1. **Hero:** the handwritten "Hi, I'm James." with a one-line positioning statement from the resume summary and the chat input *right there* ("Ask about James →")
2. **What are you curious about?** Topic chips that open the conversation panel
3. **Selected work:** 3–4 story cards (MoneyApp, JobPilot, Lesson Planner at Symph, Thesis). Each links to `/projects/[slug]`
4. **How I work:** the AI workflow as a drawn flow (Understand → Investigate → Plan → Build with AI → Review → Test → Verify), backed by real artifacts (context capsule, audit test counts)
5. **Experience and leadership:** a timeline (SYSDEV, Symph, O&B, Class President)
6. **Stack:** grouped by what it is used for, not by logo soup
7. **Currently learning:** honest, dated
8. **Contact**

The conversation opens as a side sheet on desktop and full-screen on mobile, and keeps its
state while scrolling.

## Sources

- [AI SDK 7 is now available (Vercel)](https://vercel.com/changelog/ai-sdk-7)
- [AI SDK 6 (Vercel)](https://vercel.com/blog/ai-sdk-6)
- [Multi-Step & Generative UI (Vercel Academy)](https://vercel.com/academy/ai-sdk/multi-step-and-generative-ui)
- [AI Elements](https://elements.ai-sdk.dev/) · [GitHub](https://github.com/vercel/ai-elements)
- [shadcn/ui chat components, June 2026](https://ui.shadcn.com/docs/changelog/2026-06-chat-components)
- [Next.js 16.3](https://nextjs.org/blog/next-16-3)
- [AI-portfolio (chat-first portfolio example)](https://github.com/Abhik-Chakraborty/AI-portfolio)
- [Portfolio chatbot protection layers (Medium)](https://medium.com/@lovely.mcinerney/built-a-portfolio-site-with-my-own-ai-chatbot-using-claude-code-66ca39ae15b7)
- [Instrument Serif (Google Fonts)](https://fonts.google.com/specimen/Instrument%2BSerif) · [Typewolf: best Google Fonts 2026](https://www.typewolf.com/google-fonts)
- [W3C: Understanding SC 2.3.3 Animation from Interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html)
- [Streaming AI and screen readers (TianPan)](https://tianpan.co/blog/2026/04/17/ai-accessibility-streaming-screen-readers)
- [Accessible AI chat interfaces](https://accessibility.build/guides/accessible-ai-chat)
