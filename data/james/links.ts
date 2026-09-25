import type { Link } from "@/lib/knowledge/schema";

/**
 * Every outbound link the site or the agent may render. Stage 7 uses this
 * list as the markdown link allowlist, so a URL missing here is not clickable.
 */
export const links = [
  {
    id: "email",
    label: "Email",
    url: "mailto:jamesmanonog@gmail.com",
    kind: "contact",
    sources: ["confirmed-by-james"],
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    url: "https://www.linkedin.com/in/james-manon-og-0326a7314/",
    kind: "profile",
    sources: ["confirmed-by-james", "linkedin-profile"],
  },
  {
    id: "github-mnngjms",
    label: "GitHub (mnngjms)",
    url: "https://github.com/mnngjms",
    kind: "profile",
    sources: ["resume-2026-09", "confirmed-by-james"],
  },
  {
    id: "github-jamesmanon-og",
    label: "GitHub (JamesManon-og)",
    url: "https://github.com/JamesManon-og",
    kind: "profile",
    sources: ["confirmed-by-james"],
  },
  {
    id: "moneyapp",
    label: "MoneyApp",
    url: "https://moneyapp.click",
    kind: "project",
    sources: ["resume-2026-09", "confirmed-by-james"],
  },
  {
    id: "lesson-planner",
    label: "Lesson Planner",
    url: "https://www.lessonplanner.org/v2",
    kind: "project",
    sources: ["confirmed-by-james"],
  },
  {
    id: "thesis-repo",
    label: "Thesis repository",
    url: "https://github.com/glennzyboi/Thesis-TrafficRL",
    kind: "repository",
    sources: ["thesis-repo", "confirmed-by-james"],
  },
  {
    id: "cert-react-native",
    label: "React Native Mastery certificate (notJust.dev)",
    url: "https://app.kajabi.com/certificates/9e8ce41a",
    kind: "credential",
    sources: ["linkedin-profile"],
  },
  {
    id: "cert-spring",
    label: "Spring framework certificate (Udemy)",
    url: "https://www.udemy.com/certificate/UC-d6a02e0e-4385-425e-8bcb-40ab76432f82/",
    kind: "credential",
    sources: ["linkedin-profile"],
  },
  {
    id: "cert-linux",
    label: "Linux Mastery certificate (Udemy)",
    url: "https://www.udemy.com/certificate/UC-c0201c44-b59b-421a-ad9b-a7b778d7dd6d/",
    kind: "credential",
    sources: ["linkedin-profile"],
  },
  {
    id: "cert-postgresql",
    label: "PostgreSQL certificate (Udemy)",
    url: "https://www.udemy.com/certificate/UC-bead0a38-574c-4a68-9e21-60eb97119494/",
    kind: "credential",
    sources: ["linkedin-profile"],
  },
  {
    id: "cert-ccna",
    label: "CCNA: Introduction to Networks badge (Cisco, Credly)",
    url: "https://www.credly.com/earner/earned/badge/e8b0e384-eb22-4863-8310-a62b31857c37",
    kind: "credential",
    sources: ["linkedin-profile"],
  },
  {
    id: "cert-devops",
    label: "Introduction to DevOps certificate (IBM, Coursera)",
    url: "https://www.coursera.org/account/accomplishments/records/XC7JY1O17T17",
    kind: "credential",
    sources: ["linkedin-profile"],
  },
] satisfies Link[];
