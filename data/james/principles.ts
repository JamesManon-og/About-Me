import type { Principle } from "@/lib/knowledge/schema";

/**
 * How James works, drawn from evidence in his projects and sessions.
 * All are "observed" until James states his own principles.
 */
export const principles = [
  {
    id: "plan-then-verify",
    title: "Plan first, then check the plan",
    description:
      "Before implementing, he asks for a plan, then has it double-checked and weighs the pros and cons.",
    basis: "observed",
    evidence: [
      {
        text: "He repeatedly asks the AI assistant to double-check a plan and list its pros and cons before any code is written.",
        sources: ["dev-session-notes"],
      },
    ],
  },
  {
    id: "staged-delivery",
    title: "One stage at a time",
    description:
      "Large changes are split into numbered stages, each with its own branch and pull request.",
    basis: "observed",
    evidence: [
      {
        text: "MoneyApp's mobile migration ran as numbered stages, each on its own branch and pull request.",
        sources: ["dev-session-notes"],
      },
    ],
  },
  {
    id: "verified-context",
    title: "Start each session from verified facts",
    description:
      "He writes a short, verified summary of the repository and gives it to every fresh AI session, so the work starts from facts rather than memory.",
    basis: "observed",
    evidence: [
      {
        text: 'His "context capsule" lists verified repository facts, such as the package manager, the workspace layout and stale lockfiles to ignore, and is pasted into each stage\'s new session.',
        sources: ["dev-session-notes"],
      },
    ],
  },
  {
    id: "audit-before-fixing",
    title: "Audit before fixing",
    description:
      "On unfamiliar or messy code he starts with an audit and proves each bug with a failing test before changing anything.",
    basis: "observed",
    evidence: [
      {
        text: "JobPilot's expansion began with a reliability audit in which bugs were reproduced with failing tests before they were fixed.",
        sources: ["jobpilot-repo", "dev-session-notes"],
      },
    ],
  },
  {
    id: "human-accountable",
    title: "A human stays accountable",
    description:
      "Automation prepares the work, and a person takes the final, irreversible step.",
    basis: "observed",
    evidence: [
      {
        text: "JobPilot fills in approved applications but leaves the final submit to a person.",
        sources: ["jobpilot-repo"],
      },
      {
        text: "He keeps commits and pushes to himself when working with AI assistants.",
        sources: ["dev-session-notes"],
      },
    ],
  },
  {
    id: "test-where-it-costs",
    title: "Test where mistakes cost the most",
    description:
      "Test effort goes first to the code that would cost real money if it broke.",
    basis: "observed",
    evidence: [
      {
        text: "MoneyApp's tests target split math and payments, the parts most likely to cost real money if they break.",
        sources: ["moneyapp-readme"],
      },
    ],
  },
  {
    id: "ask-why",
    title: "Ask why, not only how",
    description:
      "He asks for the reasoning behind a stack or tool choice, not only instructions for using it.",
    basis: "observed",
    evidence: [
      {
        text: "He has asked for explanations of why his own stack is built the way it is, such as NestJS versus serverless functions, and why Prisma and Supabase.",
        sources: ["dev-session-notes"],
      },
    ],
  },
] satisfies Principle[];
