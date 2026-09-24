import type { Certification, SkillGroup } from "@/lib/knowledge/schema";

/** The resume groups are authoritative. The last group is evidenced in code. */
export const skills = [
  {
    id: "languages",
    label: "Languages",
    items: ["TypeScript", "JavaScript", "Python", "Java", "SQL"],
    sources: ["resume-2026-09"],
  },
  {
    id: "frontend",
    label: "Frontend",
    items: ["React", "Next.js", "React Native", "Expo", "Tailwind CSS"],
    sources: ["resume-2026-09"],
  },
  {
    id: "backend",
    label: "Backend",
    items: [
      "Node.js",
      "NestJS",
      "Express",
      "FastAPI",
      "Spring Boot",
      "REST API design",
      "Background jobs",
    ],
    sources: ["resume-2026-09"],
  },
  {
    id: "databases",
    label: "Databases",
    items: [
      "PostgreSQL",
      "MySQL",
      "Supabase",
      "Prisma",
      "Schema design",
      "Query optimization",
    ],
    sources: ["resume-2026-09"],
  },
  {
    id: "cloud-devops",
    label: "Cloud and DevOps",
    items: [
      "Google Cloud Platform",
      "AWS EC2",
      "Docker",
      "GitHub Actions",
      "Vercel",
      "Linux",
    ],
    sources: ["resume-2026-09"],
  },
  {
    id: "practices",
    label: "Practices",
    items: [
      "Test-driven development",
      "Object-oriented design",
      "OAuth 2.0",
      "Webhooks and callbacks",
      "DNS, SPF and DKIM",
    ],
    sources: ["resume-2026-09"],
  },
  {
    id: "areas",
    label: "Areas he works across (in his own words)",
    items: ["Full-stack", "Mobile", "DevOps", "UI/UX", "Machine learning"],
    sources: ["confirmed-by-james"],
  },
  {
    id: "evidenced-in-projects",
    label: "Also used in projects",
    items: [
      "Playwright",
      "Jest",
      "Turborepo",
      "Bun",
      "TanStack Query",
      "JWT",
      "SQLAlchemy",
      "Alembic",
      "Ollama",
      "SUMO",
      "PyTorch",
      "Spring MVC",
      "Unit and integration testing",
    ],
    sources: [
      "moneyapp-readme",
      "jobpilot-repo",
      "thesis-repo",
      "confirmed-by-james",
      "linkedin-profile",
    ],
  },
] satisfies SkillGroup[];

export const certifications = [
  {
    name: "React Native Mastery",
    issuer: "notJust.dev",
    date: "2026-08",
    credentialUrl: "https://app.kajabi.com/certificates/9e8ce41a",
    sources: ["resume-2026-09", "linkedin-profile"],
  },
  {
    name: "Master Java Framework: Spring 6, Spring Boot 3, Spring Security, JPA, REST",
    issuer: "Udemy",
    date: "2025-06",
    credentialUrl:
      "https://www.udemy.com/certificate/UC-d6a02e0e-4385-425e-8bcb-40ab76432f82/",
    sources: ["resume-2026-09", "linkedin-profile"],
  },
  {
    name: "Linux Mastery: Master the Linux Command Line",
    issuer: "Udemy",
    date: "2025-06",
    credentialUrl:
      "https://www.udemy.com/certificate/UC-c0201c44-b59b-421a-ad9b-a7b778d7dd6d/",
    sources: ["resume-2026-09", "linkedin-profile"],
  },
  {
    name: "Complete PostgreSQL From Basic to Advanced",
    issuer: "Udemy",
    date: "2025-05",
    credentialUrl:
      "https://www.udemy.com/certificate/UC-bead0a38-574c-4a68-9e21-60eb97119494/",
    sources: ["resume-2026-09", "linkedin-profile"],
  },
  {
    name: "CCNA: Introduction to Networks",
    issuer: "Cisco",
    date: "2025-05",
    credentialUrl:
      "https://www.credly.com/earner/earned/badge/e8b0e384-eb22-4863-8310-a62b31857c37",
    sources: ["resume-2026-09", "linkedin-profile"],
  },
  {
    name: "Introduction to DevOps",
    issuer: "IBM",
    date: "2025-03",
    credentialUrl:
      "https://www.coursera.org/account/accomplishments/records/XC7JY1O17T17",
    sources: ["resume-2026-09", "linkedin-profile"],
  },
] satisfies Certification[];
