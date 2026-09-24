import type { Experience, Leadership } from "@/lib/knowledge/schema";

export const experience = [
  {
    id: "sysdev",
    organization:
      "SAMAHAN Systems Development (SYSDEV), Ateneo de Davao University",
    role: "Full Stack Developer",
    start: "2025-01",
    end: "2026-05",
    location: "Davao City, Philippines",
    workMode: "on-site",
    highlights: [
      {
        text: "Built REST APIs, multi-role authorization, and PostgreSQL schemas for university-wide systems used by several internal applications and admin tools.",
        sources: ["resume-2026-09"],
      },
      {
        text: "Integrated PayMongo into ADTO, a campus-wide event booking platform, handling webhook callbacks, payment state reconciliation, and the failure paths around both.",
        sources: ["resume-2026-09"],
      },
      {
        text: "Replaced manual coordination in event approval, registration, and ticketing with API integrations between internal systems.",
        sources: ["resume-2026-09"],
      },
      {
        text: "Reviewed pull requests across frontend and backend work, ran daily standups, and helped newer members with API design and data-fetching patterns.",
        sources: ["resume-2026-09"],
      },
    ],
    relatedProjects: ["adto"],
    sources: ["resume-2026-09", "confirmed-by-james"],
  },
  {
    id: "symph",
    organization: "Symph",
    role: "Web Developer Intern",
    start: "2025-08",
    end: "2026-01",
    location: "Cebu City, Philippines",
    workMode: null,
    highlights: [
      {
        text: "Shipped features to Lesson Planner, an AI lesson-planning platform with a reported user base of 645,000+ educators, working inside an existing production codebase and release process.",
        sources: ["resume-2026-09"],
      },
      {
        text: "Set up Google Cloud build and deploy workflows that removed manual release steps.",
        sources: ["resume-2026-09"],
      },
    ],
    relatedProjects: [],
    sources: ["resume-2026-09", "confirmed-by-james"],
  },
  {
    id: "orange-and-bronze",
    organization: "Orange & Bronze Software Labs, Inc.",
    role: "Backend Developer Intern",
    start: "2025-05",
    end: "2025-06",
    location: null,
    workMode: "remote",
    highlights: [
      {
        text: "Completed an intensive training program in Java, object-oriented design, and test-driven development, covering unit and integration testing practices before moving onto project work.",
        sources: ["resume-2026-09"],
      },
      {
        text: "Worked on backend performance and reliability for fintech software, under senior engineer review and the team's practices for data integrity and transactional correctness.",
        sources: ["resume-2026-09"],
      },
    ],
    relatedProjects: [],
    sources: ["resume-2026-09", "confirmed-by-james"],
  },
] satisfies Experience[];

export const leadership = [
  {
    id: "class-president",
    title: "Class President",
    organization:
      "AdDU Council of Class Presidents, Ateneo de Davao University",
    start: "2024",
    end: "2025",
    highlights: [],
    sources: ["resume-2026-09"],
  },
  {
    id: "sysdev-team-practices",
    title: "Code review and standups at SYSDEV",
    organization:
      "SAMAHAN Systems Development (SYSDEV), Ateneo de Davao University",
    start: "2025-01",
    end: "2026-05",
    highlights: [
      {
        text: "Reviewed pull requests across frontend and backend work.",
        sources: ["resume-2026-09"],
      },
      {
        text: "Ran daily standups.",
        sources: ["resume-2026-09"],
      },
      {
        text: "Helped newer members with API design and data-fetching patterns.",
        sources: ["resume-2026-09"],
      },
    ],
    sources: ["resume-2026-09"],
  },
] satisfies Leadership[];
