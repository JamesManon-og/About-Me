import type { Source } from "@/lib/knowledge/schema";

/**
 * Where each published fact comes from. Every `sources` id elsewhere in
 * `data/james` and `content/james` must match one of these.
 *
 * Titles are public-safe descriptions. Private repositories and local files
 * are named but never linked.
 */
export const sources = [
  {
    id: "resume-2026-09",
    title: "James's resume (September 2026)",
    kind: "resume",
    url: null,
    date: "2026-09",
  },
  {
    id: "confirmed-by-james",
    title: "Confirmed directly by James (September 2026)",
    kind: "confirmation",
    url: null,
    date: "2026-09",
  },
  {
    id: "moneyapp-readme",
    title: "MoneyApp project README",
    kind: "repository",
    url: null,
    date: null,
  },
  {
    id: "jobpilot-repo",
    title: "JobPilot project code and README",
    kind: "repository",
    url: null,
    date: null,
  },
  {
    id: "thesis-repo",
    title: "Thesis repository (Thesis-TrafficRL)",
    kind: "repository",
    url: "https://github.com/glennzyboi/Thesis-TrafficRL",
    date: null,
  },
  {
    id: "thesis-writeup",
    title: "James's write-up of the thesis",
    kind: "writeup",
    url: null,
    date: "2026-09",
  },
  {
    id: "thesis-research-files",
    title: "Thesis literature review files",
    kind: "writeup",
    url: null,
    date: null,
  },
  {
    id: "adto-codebase",
    title: "ADTO codebase (SAMAHAN Systems Development)",
    kind: "repository",
    url: null,
    date: null,
  },
  {
    id: "linkedin-profile",
    title: "James's LinkedIn profile",
    kind: "profile",
    url: "https://www.linkedin.com/in/james-manon-og-0326a7314/",
    date: "2026-09",
  },
  {
    id: "dev-session-notes",
    title: "Notes from James's AI-assisted development sessions",
    kind: "session-notes",
    url: null,
    date: "2026-09",
  },
] satisfies Source[];
