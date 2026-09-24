import type { Profile } from "@/lib/knowledge/schema";

export const profile = {
  name: "James Manon-og",
  headline: {
    text: "Full-stack developer working mainly in TypeScript, Python, and Java. Most of my work has been API and integration heavy: payment and email provider integrations, webhook handling, multi-step workflows, and moving manual operational steps into code.",
    sources: ["resume-2026-09"],
  },
  selfDescription: {
    text: "James describes himself as able to work across full-stack, mobile, DevOps, UI/UX and machine learning, and says his goal now is to grow to a senior engineering level.",
    sources: ["confirmed-by-james"],
  },
  location: {
    text: "Davao City, Philippines",
    sources: ["resume-2026-09"],
  },
  timezone: "UTC+8",
  workMode: {
    text: "Works remotely, from UTC+8.",
    sources: ["resume-2026-09"],
  },
  education: [
    {
      degree: "Bachelor of Science in Computer Science",
      school: "Ateneo de Davao University",
      start: "2022-08",
      end: "2026-05",
      sources: ["resume-2026-09"],
    },
  ],
  contact: {
    email: "jamesmanonog@gmail.com",
    sources: ["confirmed-by-james"],
  },
  targetRoles: null,
  currentlyLearning: [
    {
      text: "System architecture, through a self-directed study plan aimed at senior-level design judgment (started September 2026).",
      sources: ["dev-session-notes"],
    },
    {
      text: "AI engineering, with a focus on evaluation and security (started September 2026).",
      sources: ["dev-session-notes"],
    },
    {
      text: "DevOps and cloud infrastructure, with a planned AWS capstone project that has not been built yet.",
      sources: ["dev-session-notes"],
    },
  ],
  sources: ["resume-2026-09", "confirmed-by-james"],
} satisfies Profile;
