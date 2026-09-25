import type { Faq } from "@/lib/knowledge/schema";

/**
 * Common questions. `known: false` entries are deliberate: the agent must say
 * it doesn't have that information instead of guessing.
 */
export const faq = [
  {
    id: "where-based",
    known: true,
    question: "Where is James based?",
    answer:
      "Davao City, Philippines. He works remotely, in the UTC+8 time zone.",
    sources: ["resume-2026-09"],
  },
  {
    id: "main-languages",
    known: true,
    question: "What does James mainly work with?",
    answer:
      "TypeScript, Python and Java. Most of his work has been API and integration heavy: payment and email provider integrations, webhook handling and multi-step workflows.",
    sources: ["resume-2026-09"],
  },
  {
    id: "contact",
    known: true,
    question: "How can I contact James?",
    answer: "By email at jamesmanonog@gmail.com, or through LinkedIn.",
    sources: ["confirmed-by-james"],
  },
  {
    id: "moneyapp-payments",
    known: true,
    question: "Does MoneyApp process payments?",
    answer:
      "No. It tracks settlements made through GCash or cash. Proof is attached, the payee has to verify each settlement, and unverified ones stay pending.",
    sources: ["moneyapp-readme"],
    relatedProjects: ["moneyapp"],
  },
  {
    id: "thesis-team",
    known: true,
    question: "Did James do his thesis alone?",
    answer:
      "No. It was a three-person group thesis on traffic signal control with deep reinforcement learning. James's role was Researcher & Developer.",
    sources: ["thesis-writeup", "confirmed-by-james"],
    relatedProjects: ["traffic-signal-rl"],
  },
  {
    id: "education",
    known: true,
    question: "Where did James study?",
    answer:
      "Ateneo de Davao University, for a Bachelor of Science in Computer Science, from August 2022 to May 2026.",
    sources: ["resume-2026-09"],
  },
  {
    id: "ai-tools",
    known: true,
    question: "Which AI tools does James use?",
    answer:
      "Claude Code is the one documented in his work. He uses it in planned, staged sessions and keeps commits and pushes to himself.",
    sources: ["dev-session-notes"],
  },
  {
    id: "target-roles",
    known: true,
    question: "What roles is James looking for?",
    answer:
      "He hasn't named specific job titles. He says he can work across full-stack, mobile, DevOps, UI/UX and machine learning, and that his goal is to grow to a senior engineering level.",
    sources: ["confirmed-by-james"],
  },
  {
    id: "thesis-framework",
    known: true,
    question: "Which machine learning framework did the thesis use?",
    answer:
      "James says the thesis model work used PyTorch. The agent code in the public repository imports TensorFlow, so a visitor reading the repo will see TensorFlow there.",
    sources: ["confirmed-by-james", "thesis-repo"],
    relatedProjects: ["traffic-signal-rl"],
  },
  {
    id: "favourite-language",
    known: false,
    question: "What is James's favourite programming language?",
    answer: null,
  },
  {
    id: "weakness",
    known: false,
    question: "What is James's biggest weakness?",
    answer: null,
  },
  {
    id: "hobbies",
    known: false,
    question: "What does James do outside of coding?",
    answer: null,
  },
  {
    id: "thesis-results",
    known: false,
    question: "What were the thesis's final results?",
    answer: null,
  },
  {
    id: "thesis-own-part",
    known: true,
    question: "Which parts of the thesis did James personally build?",
    answer:
      "According to James, he did the research thinking and the thesis papers, all of the development including the whole SUMO simulation, and the data collection work of recording traffic video and annotating it. The thesis itself was a three-person group project.",
    sources: ["confirmed-by-james"],
  },
  {
    id: "next-goal",
    known: true,
    question: "What is James aiming for next?",
    answer:
      "In his own words, he can work across full-stack, mobile, DevOps, UI/UX and machine learning, and his goal now is to grow to a senior engineering level.",
    sources: ["confirmed-by-james"],
  },
] satisfies Faq[];
