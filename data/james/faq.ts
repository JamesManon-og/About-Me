import type { Faq } from "@/lib/knowledge/schema";
import { skills } from "./skills";

/**
 * The prebuilt answer set. The chat matches a visitor's question to one of these without
 * any model (lib/answers/), so every answer here is one James has read and approved.
 *
 * Voice: a colleague who knows James's work well. Lead with the point and the thinking
 * behind the work, in plain words, then the specifics. Third person, two to four
 * sentences, a list only when listing. Explain reasoning only where the records state it;
 * never invent feelings, opinions, motives, metrics or employers.
 *
 * `variants` are other ways to ask, used only for matching. Don't copy an eval question
 * (evals/cases.ts) into them. `known: false` entries answer with the fixed unknown reply.
 */

const EMAIL = "jamesmanonog@gmail.com";
const LINKEDIN = "https://www.linkedin.com/in/james-manon-og-0326a7314/";
const MONEYAPP = "[moneyapp.click](https://moneyapp.click)";

export const faq = [
  /* ---------------------------------------------------------------- */
  /* Who he is                                                         */
  /* ---------------------------------------------------------------- */
  {
    id: "about-james",
    known: true,
    question: "Who is James?",
    variants: [
      "Tell me about James",
      "Who is James Manon-og?",
      "Give me a quick intro to James",
      "Summarize James in a few lines",
    ],
    answer:
      "James Manon-og is a full-stack developer based in Davao City, Philippines. The thread through his work is connecting systems: payment and email providers, webhooks, and the multi-step workflows between them, often turning a manual step into code. He works mainly in TypeScript, Python and Java, studied Computer Science at Ateneo de Davao University, and says his goal now is to grow into a senior engineer.",
    sources: ["resume-2026-09", "confirmed-by-james"],
    followUps: ["what-can-he-do", "projects", "experience"],
  },
  {
    id: "what-can-he-do",
    known: true,
    question: "What can James do?",
    variants: [
      "What is James good at?",
      "What does James do?",
      "What kind of developer is James?",
      "Is James a full-stack developer?",
      "What is his specialty?",
    ],
    answer:
      "Most of James's work sits where systems meet: payment and email providers, webhooks, and the workflows that connect internal tools. He's a full-stack developer working mainly in TypeScript, Python and Java. In his own words, he can work across full-stack, mobile, DevOps, UI/UX and machine learning, and his projects cover that range, from a shared-expense app with an iOS companion to a local AI job-search agent and a reinforcement learning thesis.",
    sources: [
      "resume-2026-09",
      "confirmed-by-james",
      "moneyapp-readme",
      "jobpilot-repo",
      "thesis-writeup",
    ],
    followUps: ["projects", "skills", "experience"],
  },
  {
    id: "where-based",
    known: true,
    question: "Where is James based?",
    variants: [
      "Where is James located?",
      "What time zone is James in?",
      "Does James work remotely?",
      "Which city is James in?",
      "What country is he in?",
    ],
    answer: "Davao City, in the Philippines. He works remotely, on UTC+8.",
    sources: ["resume-2026-09"],
    followUps: ["contact", "target-roles"],
  },
  {
    id: "main-languages",
    known: true,
    question: "What does James mainly work with?",
    variants: [
      "What programming languages does James use?",
      "Which languages does he code in?",
      "What technologies does James use most?",
      "What is his main language?",
    ],
    answer:
      "TypeScript, Python and Java, day to day. What he builds with them tends to be integration work: payment and email providers, webhook handling, and multi-step workflows that take a manual process and move it into code.",
    sources: ["resume-2026-09"],
    followUps: ["skills", "projects", "what-can-he-do"],
  },
  {
    id: "contact",
    known: true,
    question: "How can I contact James?",
    variants: [
      "What is James's email address?",
      "How do I get in touch with James?",
      "How can I hire James?",
      "Can I message James?",
      "How do I reach out?",
    ],
    answer: `You can email him at [${EMAIL}](mailto:${EMAIL}), or find him on [LinkedIn](${LINKEDIN}).`,
    sources: ["confirmed-by-james"],
    followUps: ["links", "target-roles"],
  },
  {
    id: "links",
    known: true,
    question: "Where can I find James online?",
    variants: [
      "Does James have a GitHub account?",
      "Is James on GitHub?",
      "What is James's LinkedIn?",
      "Where are his online profiles?",
    ],
    answer: `On [LinkedIn](${LINKEDIN}), and on GitHub under two accounts, [mnngjms](https://github.com/mnngjms) and [JamesManon-og](https://github.com/JamesManon-og). If you'd like to see his work running, his shared-expense app MoneyApp is live at ${MONEYAPP}.`,
    sources: ["confirmed-by-james", "resume-2026-09", "linkedin-profile"],
    followUps: ["contact", "projects"],
  },
  {
    id: "education",
    known: true,
    question: "Where did James study?",
    variants: [
      "What degree does James have?",
      "Which university did James attend?",
      "When did James graduate?",
      "What did he study in college?",
    ],
    answer:
      "At Ateneo de Davao University, for a Bachelor of Science in Computer Science, from August 2022 to May 2026. Alongside his studies he served as a Class President, worked as a Full Stack Developer at SAMAHAN Systems Development, and did a three-person group thesis on traffic signal control with deep reinforcement learning.",
    sources: ["resume-2026-09", "thesis-writeup"],
    followUps: ["thesis", "leadership", "sysdev"],
  },
  {
    id: "experience",
    known: true,
    question: "Where has James worked?",
    variants: [
      "What is James's work experience?",
      "Which companies has James worked at?",
      "What jobs has James had?",
      "Tell me about his career so far",
      "How much experience does James have?",
      "Where did he intern?",
    ],
    answer:
      "Three places so far. His longest role was Full Stack Developer at SAMAHAN Systems Development (SYSDEV), Ateneo de Davao University, from January 2025 to May 2026. Along the way he did two internships: Backend Developer Intern at Orange & Bronze Software Labs (May to June 2025, remote) and Web Developer Intern at Symph in Cebu City (August 2025 to January 2026).",
    sources: ["resume-2026-09", "confirmed-by-james"],
    followUps: ["sysdev", "symph", "orange-bronze"],
  },
  {
    id: "target-roles",
    known: true,
    question: "What roles is James looking for?",
    variants: [
      "Is James looking for a job?",
      "What kind of job does James want?",
      "Is James open to new opportunities?",
      "What position is he aiming for?",
      "Is he available for work?",
    ],
    answer: `He hasn't pinned it to specific job titles. What he has said is that he can work across full-stack, mobile, DevOps, UI/UX and machine learning, and that he wants to grow into a senior engineer. If you have a role in mind, the simplest thing is to email him at ${EMAIL}.`,
    sources: ["confirmed-by-james"],
    followUps: ["next-goal", "contact"],
  },
  {
    id: "next-goal",
    known: true,
    question: "What is James aiming for next?",
    variants: [
      "What are James's career goals?",
      "Where does James want to grow?",
      "What is his long-term goal?",
    ],
    answer:
      "Growing into a senior engineer. He's working toward it with a self-directed study plan in system architecture, started in September 2026 and aimed at the design judgment senior roles need, alongside AI engineering and DevOps.",
    sources: ["confirmed-by-james", "dev-session-notes"],
    followUps: ["learning", "target-roles"],
  },
  {
    id: "learning",
    known: true,
    question: "What is James learning or studying right now?",
    variants: [
      "Is James learning anything new?",
      "What skills is James building at the moment?",
      "What is he picking up lately?",
    ],
    answer:
      "Three things, all in progress rather than finished: system architecture, through a self-directed plan aimed at senior-level design judgment; AI engineering, with a focus on evaluation and security (both started in September 2026); and DevOps and cloud infrastructure, with an AWS capstone project planned but not built yet.",
    sources: ["dev-session-notes"],
    followUps: ["next-goal", "ai-workflow"],
  },

  /* ---------------------------------------------------------------- */
  /* How he works                                                      */
  /* ---------------------------------------------------------------- */
  {
    id: "working-style",
    known: true,
    question: "How does James approach his work?",
    variants: [
      "What is James's working style?",
      "What principles does James follow?",
      "What are his engineering habits?",
    ],
    answer:
      "A few habits show up again and again in his work. He plans before he builds and has the plan checked. He splits big changes into small, numbered stages. On unfamiliar code he audits first and proves each bug with a failing test before fixing it. He puts testing effort where a mistake would cost real money. And when he automates something, a person still takes the final, irreversible step.",
    sources: ["dev-session-notes", "jobpilot-repo", "moneyapp-readme"],
    followUps: ["testing", "problem-solving", "ai-workflow"],
  },
  {
    id: "ai-tools",
    known: true,
    question: "Which AI tools does James use?",
    variants: [
      "Does James use AI to code?",
      "Does James use Claude Code?",
      "Which AI assistants does he work with?",
    ],
    answer:
      "Claude Code is the one documented in his work. He uses it in planned, staged sessions, and he keeps commits and pushes to himself, so a person always signs off on what lands.",
    sources: ["dev-session-notes"],
    followUps: ["ai-workflow", "ai-projects"],
  },
  {
    id: "ai-workflow",
    known: true,
    question: "How does James work with AI?",
    variants: [
      "What is James's AI workflow?",
      "How does he use Claude Code?",
      "How does James use AI assistants in development?",
      "What is a context capsule?",
    ],
    answer:
      'From his documented sessions, a few habits stand out. He asks for a plan before any code, then has it double-checked with the pros and cons laid out. Big changes run as numbered stages, each on its own branch and pull request. Every new session starts from a short "context capsule" of verified repository facts, so the work begins from checked facts rather than memory. And he keeps commits and pushes to himself.',
    sources: ["dev-session-notes"],
    followUps: ["ai-tools", "working-style", "learning"],
  },
  {
    id: "testing",
    known: true,
    question: "How does James approach testing?",
    variants: [
      "Does James write tests?",
      "Does James do test-driven development?",
      "What testing tools does he use?",
    ],
    answer:
      "He puts test effort first where a bug would cost real money. In MoneyApp that means the split math and payments, covered by Jest unit and integration tests, Playwright end-to-end tests and a check for Prisma migration drift. In JobPilot's reliability audit he reproduced each bug with a failing test before fixing it, and the suite grew from 93 to roughly 315 tests, on a branch that isn't released yet. He also trained in test-driven development at Orange & Bronze.",
    sources: [
      "moneyapp-readme",
      "jobpilot-repo",
      "dev-session-notes",
      "resume-2026-09",
    ],
    followUps: ["moneyapp-testing", "jobpilot-audit", "working-style"],
  },
  {
    id: "problem-solving",
    known: true,
    question: "How does James solve problems?",
    variants: [
      "How does James debug?",
      "Give an example of a problem James solved",
      "How does he handle tricky bugs?",
      "What is his approach to debugging?",
    ],
    answer:
      "By following a problem to its root. When MoneyApp's emails weren't being delivered, he traced the failures down to domain verification while setting up DNS, SPF and DKIM. In JobPilot he didn't fix a bug until a failing test had reproduced it. And in MoneyApp he moved balance calculations out of application code and into PostgreSQL SUM queries, where that work belonged.",
    sources: ["resume-2026-09", "jobpilot-repo", "dev-session-notes"],
    followUps: ["working-style", "testing", "moneyapp-highlights"],
  },
  {
    id: "leadership",
    known: true,
    question: "Does James have leadership experience?",
    variants: [
      "Has James led a team?",
      "Was James a class president?",
      "Has James mentored anyone?",
      "Does he review code?",
    ],
    answer:
      "Yes, both in and out of code. He served as a Class President on the AdDU Council of Class Presidents in 2024 to 2025. At SAMAHAN Systems Development he ran daily standups, reviewed pull requests across frontend and backend work, and helped newer members with API design and data-fetching patterns.",
    sources: ["resume-2026-09"],
    followUps: ["sysdev", "working-style"],
  },

  /* ---------------------------------------------------------------- */
  /* Skills                                                            */
  /* ---------------------------------------------------------------- */
  {
    id: "skills",
    known: true,
    question: "What are James's technical skills?",
    variants: [
      "What technologies does James know?",
      "List James's skills",
      "Does James know Java?",
      "Does he know Python?",
      "What frameworks does James use?",
    ],
    answer: [
      "Here's the short version, grouped the way he lists them:",
      "",
      "- **Languages:** TypeScript, JavaScript, Python, Java, SQL",
      "- **Frontend:** React, Next.js, React Native, Expo, Tailwind CSS",
      "- **Backend:** Node.js, NestJS, Express, FastAPI, Spring Boot, REST API design, background jobs",
      "- **Databases:** PostgreSQL, MySQL, Supabase, Prisma, schema design, query optimization",
      "- **Cloud and DevOps:** Google Cloud Platform, AWS EC2, Docker, GitHub Actions, Vercel, Linux",
      "- **Practices:** test-driven development, object-oriented design, OAuth 2.0, webhooks, DNS, SPF and DKIM",
    ].join("\n"),
    sources: ["resume-2026-09"],
    keywords: skills.flatMap((group) => group.items),
    followUps: ["main-languages", "certifications", "projects"],
  },
  {
    id: "certifications",
    known: true,
    question: "What certifications does James have?",
    variants: [
      "Does James have any certificates?",
      "Which courses has James completed?",
      "Is James certified in anything?",
    ],
    answer: [
      "Six, each with a public verification link:",
      "",
      "- [React Native Mastery](https://app.kajabi.com/certificates/9e8ce41a), notJust.dev (August 2026)",
      "- [Master Java Framework: Spring 6, Spring Boot 3, Spring Security, JPA, REST](https://www.udemy.com/certificate/UC-d6a02e0e-4385-425e-8bcb-40ab76432f82/), Udemy (June 2025)",
      "- [Linux Mastery: Master the Linux Command Line](https://www.udemy.com/certificate/UC-c0201c44-b59b-421a-ad9b-a7b778d7dd6d/), Udemy (June 2025)",
      "- [Complete PostgreSQL From Basic to Advanced](https://www.udemy.com/certificate/UC-bead0a38-574c-4a68-9e21-60eb97119494/), Udemy (May 2025)",
      "- [CCNA: Introduction to Networks](https://www.credly.com/earner/earned/badge/e8b0e384-eb22-4863-8310-a62b31857c37), Cisco (May 2025)",
      "- [Introduction to DevOps](https://www.coursera.org/account/accomplishments/records/XC7JY1O17T17), IBM (March 2025)",
    ].join("\n"),
    sources: ["resume-2026-09", "linkedin-profile"],
    keywords: ["Udemy", "Cisco", "CCNA", "IBM", "Coursera", "notJust.dev"],
    followUps: ["skills", "learning"],
  },
  {
    id: "mobile",
    known: true,
    question: "Can James build mobile apps?",
    variants: [
      "Has James made an iOS app?",
      "Does he do mobile development?",
      "Does MoneyApp have a mobile app?",
    ],
    answer:
      "Yes. He built MoneyApp's iOS companion app with Expo and React Native, and it's made for patchy connections: it keeps an offline outbox, and a unique request id on the server means a replayed request can't be applied twice. He also holds a React Native Mastery certificate from notJust.dev.",
    sources: ["moneyapp-readme", "resume-2026-09"],
    relatedProjects: ["moneyapp"],
    followUps: ["moneyapp", "frontend", "certifications"],
  },
  {
    id: "frontend",
    known: true,
    question: "What frontend experience does James have?",
    variants: [
      "Does James know React?",
      "Can James build user interfaces?",
      "Is he a frontend developer?",
      "Does he do UI/UX design?",
    ],
    answer:
      "He works in React, Next.js, React Native, Expo and Tailwind CSS. MoneyApp's web app is Next.js with React, Tailwind CSS, Radix UI and TanStack Query, and JobPilot has a Next.js and React frontend. UI/UX is also one of the areas he says he can work across.",
    sources: [
      "resume-2026-09",
      "moneyapp-readme",
      "jobpilot-repo",
      "confirmed-by-james",
    ],
    followUps: ["mobile", "skills", "moneyapp-stack"],
  },
  {
    id: "backend",
    known: true,
    question: "What backend experience does James have?",
    variants: [
      "Is James a backend developer?",
      "Has James built APIs?",
      "What server-side frameworks does he know?",
      "Does he know Node.js?",
    ],
    answer:
      "Most of his work has been API and integration heavy. At SAMAHAN Systems Development he built REST APIs, multi-role authorization and PostgreSQL schemas for university-wide systems, and integrated PayMongo into ADTO. At Orange & Bronze he worked on backend performance and reliability for fintech software under senior engineer review. On his own projects he has used NestJS and Next.js route handlers with Prisma and PostgreSQL (MoneyApp), and FastAPI with SQLAlchemy and SQLite (JobPilot).",
    sources: ["resume-2026-09", "moneyapp-readme", "jobpilot-repo"],
    followUps: ["databases", "payments", "sysdev"],
  },
  {
    id: "databases",
    known: true,
    question: "Which databases has James worked with?",
    variants: [
      "Does James know SQL?",
      "Has he used PostgreSQL?",
      "What database experience does James have?",
    ],
    answer:
      "PostgreSQL, MySQL, Supabase and Prisma, plus SQLite in JobPilot. He designed PostgreSQL schemas for university-wide systems at SYSDEV, and in MoneyApp he moved balance aggregation out of the app and into PostgreSQL SUM queries, which cut per-request work and kept computed and stored balances in sync. He also has a Udemy certificate in PostgreSQL.",
    sources: ["resume-2026-09", "jobpilot-repo"],
    followUps: ["backend", "moneyapp-highlights"],
  },
  {
    id: "devops",
    known: true,
    question: "Does James have DevOps experience?",
    variants: [
      "Does James know AWS?",
      "Has he worked with Docker?",
      "Does James have cloud experience?",
      "Can James set up CI/CD?",
    ],
    answer:
      "Yes. At Symph he set up Google Cloud build and deploy workflows that took manual steps out of releases. His toolkit includes Docker, GitHub Actions, Vercel, Linux and AWS EC2, and he holds IBM's Introduction to DevOps certificate. It's also something he's still learning: he's studying DevOps and cloud infrastructure, with an AWS capstone project planned.",
    sources: ["resume-2026-09", "dev-session-notes"],
    followUps: ["symph", "learning", "skills"],
  },
  {
    id: "machine-learning",
    known: true,
    question: "Does James have machine learning experience?",
    variants: [
      "Has James done any AI or ML work?",
      "Does James know PyTorch?",
      "Has James worked with reinforcement learning?",
      "Does he know deep learning?",
    ],
    answer:
      "Yes. His undergraduate group thesis trained a deep reinforcement learning agent (a Dueling Double DQN) to run traffic signals at real Davao City intersections, simulated in SUMO. James says the model work used PyTorch. More recently, JobPilot uses a local language model through Ollama to score job postings, and machine learning is one of the areas he says he can work across.",
    sources: [
      "thesis-writeup",
      "thesis-repo",
      "confirmed-by-james",
      "jobpilot-repo",
    ],
    followUps: ["thesis", "ai-projects"],
  },
  {
    id: "ai-projects",
    known: true,
    question: "Has James built anything with AI?",
    variants: [
      "What AI projects has James worked on?",
      "Has James built an AI agent?",
      "Does James have experience with LLMs?",
    ],
    answer:
      "Yes. JobPilot is a local AI agent he's building on his own: it scores job postings against a candidate profile with a local model and prepares applications, but a person always clicks submit. His group thesis trained a reinforcement learning agent to control traffic signals. And at Symph he shipped features to Lesson Planner, an AI lesson-planning platform.",
    sources: ["jobpilot-repo", "resume-2026-09", "thesis-writeup"],
    followUps: ["jobpilot", "machine-learning", "ai-workflow"],
  },
  {
    id: "payments",
    known: true,
    question: "Has James worked with payment integrations?",
    variants: [
      "Does James know PayMongo?",
      "Has he handled webhooks?",
      "Has James integrated a payment gateway?",
    ],
    answer:
      "Yes. At SAMAHAN Systems Development he integrated PayMongo into ADTO, a campus-wide event booking platform, and the work went past the happy path: webhook callbacks, reconciling payment states, and the failure paths around both. His own app, MoneyApp, takes a different approach by design: it tracks settlements made through GCash or cash rather than moving money itself.",
    sources: ["resume-2026-09", "moneyapp-readme"],
    followUps: ["adto", "moneyapp-payments"],
  },

  /* ---------------------------------------------------------------- */
  /* Projects                                                          */
  /* ---------------------------------------------------------------- */
  {
    id: "projects",
    known: true,
    question: "What projects has James built?",
    variants: [
      "Show me James's projects",
      "What has James built?",
      "What side projects does James have?",
      "What is James working on?",
    ],
    answer: [
      "Four you can ask about:",
      "",
      `- **MoneyApp**: a shared-expense app with an iOS companion, built solo and live at ${MONEYAPP}`,
      "- **JobPilot**: a local AI agent that finds and scores job postings and prepares applications, stopping before submit",
      "- **His thesis**: traffic signal control with deep reinforcement learning, a three-person group project",
      "- **ADTO**: a campus event booking platform at Ateneo de Davao University, where he integrated PayMongo",
    ].join("\n"),
    sources: [
      "resume-2026-09",
      "moneyapp-readme",
      "jobpilot-repo",
      "thesis-writeup",
    ],
    followUps: ["moneyapp", "jobpilot", "thesis"],
  },

  // MoneyApp
  {
    id: "moneyapp",
    known: true,
    question: "What is MoneyApp?",
    variants: [
      "What does MoneyApp do?",
      "Explain the MoneyApp project",
      "What is Money App?",
    ],
    answer: `MoneyApp keeps track of who owes whom when people share expenses. A group logs what it spends, each expense splits into per-member shares, and a running debt ledger shows the balances. James built it on his own, with a web app and an iOS companion app, and it's live at ${MONEYAPP} and still in active development.`,
    sources: ["resume-2026-09", "moneyapp-readme"],
    relatedProjects: ["moneyapp"],
    keywords: ["expense", "split", "debt", "ledger", "owe"],
    followUps: ["moneyapp-payments", "moneyapp-highlights", "moneyapp-stack"],
  },
  {
    id: "moneyapp-payments",
    known: true,
    question: "Does MoneyApp process payments?",
    variants: [
      "Can you pay through MoneyApp?",
      "How are debts settled in MoneyApp?",
      "Does MoneyApp move money between users?",
    ],
    answer:
      "No, and that's deliberate. People settle up through GCash or cash and attach proof, then the person being paid has to verify it. Until they do, the settlement stays pending, so a claim alone never clears a debt.",
    sources: ["moneyapp-readme"],
    relatedProjects: ["moneyapp"],
    followUps: ["moneyapp", "moneyapp-testing"],
  },
  {
    id: "moneyapp-stack",
    known: true,
    question: "What is MoneyApp built with?",
    variants: [
      "What stack does MoneyApp use?",
      "Which technologies power MoneyApp?",
      "What framework is MoneyApp written in?",
    ],
    answer:
      "TypeScript end to end, in a Turborepo and Bun monorepo. The web app uses Next.js (App Router), React, Tailwind CSS, Radix UI and TanStack Query, and the iOS app uses Expo and React Native. Behind them are a NestJS API that's being migrated to Next.js route handlers, Prisma and PostgreSQL on Supabase, and Resend for email, with Jest and Playwright for tests, hosted on Vercel and Render.",
    sources: ["moneyapp-readme", "resume-2026-09"],
    relatedProjects: ["moneyapp"],
    followUps: ["moneyapp-migration", "moneyapp-highlights"],
  },
  {
    id: "moneyapp-solo",
    known: true,
    question: "Did James build MoneyApp alone?",
    variants: [
      "Is MoneyApp a solo project?",
      "Who built MoneyApp?",
      "Did anyone help James with MoneyApp?",
    ],
    answer:
      "Yes. MoneyApp is a solo project: James is its only developer, from the database to the iOS app. He started it in January 2026 and is still building it.",
    sources: ["resume-2026-09", "moneyapp-readme"],
    relatedProjects: ["moneyapp"],
    followUps: ["moneyapp-stack", "moneyapp-highlights"],
  },
  {
    id: "moneyapp-migration",
    known: true,
    question: "Is MoneyApp's backend migration finished?",
    variants: [
      "Is MoneyApp still on NestJS?",
      "Where is MoneyApp's backend hosted?",
      "What is the MoneyApp NestJS migration?",
    ],
    answer:
      "Not yet. The backend is moving from a standalone NestJS API on Render to Next.js route handlers on Vercel, and it's partway through. During the move, NestJS still owns the Prisma schema and the database migrations.",
    sources: ["moneyapp-readme"],
    relatedProjects: ["moneyapp"],
    followUps: ["moneyapp-stack", "moneyapp-highlights"],
  },
  {
    id: "moneyapp-link",
    known: true,
    question: "Where can I try MoneyApp?",
    variants: [
      "Is there a MoneyApp demo?",
      "Is MoneyApp available online?",
      "What is MoneyApp's URL?",
      "Can I use MoneyApp?",
    ],
    answer: `It's live at ${MONEYAPP}. Sign-in is with a Google account.`,
    sources: ["resume-2026-09", "moneyapp-readme"],
    relatedProjects: ["moneyapp"],
    followUps: ["moneyapp", "moneyapp-source"],
  },
  {
    id: "moneyapp-source",
    known: true,
    question: "Is MoneyApp's source code public?",
    variants: [
      "Is MoneyApp open source?",
      "Where is the MoneyApp repository?",
      "Is MoneyApp on GitHub?",
    ],
    answer: `No, the code is private, so there's no repository to share. You can still see the app itself running at ${MONEYAPP}.`,
    sources: ["resume-2026-09", "moneyapp-readme"],
    relatedProjects: ["moneyapp"],
    followUps: ["moneyapp-link", "moneyapp-stack"],
  },
  {
    id: "moneyapp-testing",
    known: true,
    question: "How is MoneyApp tested?",
    variants: ["Does MoneyApp have tests?", "What testing does MoneyApp use?"],
    answer:
      "The tests go where a bug would cost someone real money: the split math and the payments. There are Jest unit and integration tests, Playwright end-to-end tests, and a check for Prisma migration drift.",
    sources: ["moneyapp-readme"],
    relatedProjects: ["moneyapp"],
    followUps: ["testing", "moneyapp-highlights"],
  },
  {
    id: "moneyapp-highlights",
    known: true,
    question: "What was technically interesting about MoneyApp?",
    variants: [
      "What are the engineering highlights of MoneyApp?",
      "What challenges did James solve in MoneyApp?",
      "How does MoneyApp work under the hood?",
    ],
    answer:
      "A few decisions stand out, and they're all about keeping the numbers right. The split math lives in a shared package, so the web and iOS apps always compute the same result. Balances are added up in PostgreSQL rather than in app code, which cut per-request work and keeps stored and computed balances in sync. Every state change is saved as it happens, so an interrupted workflow can pick up where it left off. And notifications are only written once the transaction behind them has committed.",
    sources: ["resume-2026-09", "moneyapp-readme"],
    relatedProjects: ["moneyapp"],
    followUps: ["moneyapp-testing", "moneyapp-stack"],
  },

  // JobPilot
  {
    id: "jobpilot",
    known: true,
    question: "What is JobPilot?",
    variants: [
      "What does JobPilot do?",
      "What is the Job Search Automation Pipeline?",
      "What is Job Pilot?",
    ],
    answer:
      "JobPilot takes the repetitive part out of a job search without taking the person out of it. It's a local AI agent James is building on his own: it gathers postings from several job boards, scores each one against a candidate profile with a model running on the user's own machine, drafts application materials, and fills in the applications the person has approved. Then it stops, and a human clicks submit. His resume calls it the Job Search Automation Pipeline.",
    sources: ["resume-2026-09", "jobpilot-repo"],
    relatedProjects: ["jobpilot"],
    followUps: ["jobpilot-submit", "jobpilot-local", "jobpilot-audit"],
  },
  {
    id: "jobpilot-submit",
    known: true,
    question: "Does JobPilot submit applications by itself?",
    variants: [
      "Can JobPilot apply to jobs without me?",
      "Does JobPilot bypass CAPTCHAs?",
      "Is JobPilot safe to run?",
    ],
    answer:
      "Never. It fills in applications a person has already approved, in a real browser, and then stops so a human can click submit. It also won't bypass CAPTCHA or multi-factor authentication, and per-platform daily caps, a circuit breaker and a pause switch keep it from doing too much on its own.",
    sources: ["jobpilot-repo"],
    relatedProjects: ["jobpilot"],
    followUps: ["jobpilot", "jobpilot-sources"],
  },
  {
    id: "jobpilot-stack",
    known: true,
    question: "What is JobPilot built with?",
    variants: [
      "Which technologies does JobPilot use?",
      "What language is JobPilot written in?",
      "What does JobPilot store its data in?",
      "What database does JobPilot run on?",
    ],
    answer:
      "Python 3.12 and FastAPI on the backend, with async SQLAlchemy and Alembic over a SQLite database. Playwright drives the browser, Ollama runs the local model, Docker packages it, and the frontend is Next.js and React.",
    sources: ["jobpilot-repo"],
    relatedProjects: ["jobpilot"],
    followUps: ["jobpilot-local", "jobpilot-audit"],
  },
  {
    id: "jobpilot-audit",
    known: true,
    question: "What was the JobPilot reliability audit?",
    variants: [
      "How did James fix JobPilot's bugs?",
      "How many tests does JobPilot have?",
      "What bugs did James find in JobPilot?",
    ],
    answer:
      'In September 2026 James went through JobPilot looking for what was broken, with one rule: reproduce each bug with a failing test before fixing it. The fixes covered broken scraping, a ranking crash, false "submitted" states, approval races, CSRF protection and the Docker setup, and the test suite grew from 93 to roughly 315 tests. The work is on a branch and hasn\'t been released yet.',
    sources: ["jobpilot-repo", "dev-session-notes"],
    relatedProjects: ["jobpilot"],
    followUps: ["testing", "jobpilot"],
  },
  {
    id: "jobpilot-local",
    known: true,
    question: "Why does JobPilot run its model locally?",
    variants: [
      "Which model does JobPilot use?",
      "Does JobPilot use OpenAI?",
      "Does JobPilot send data to the cloud?",
    ],
    answer:
      "Two reasons: cost and privacy. Running the model through Ollama on the user's own machine means no per-token bill, and resumes and job listings never go to a third-party server. The README names qwen3:8b as the model.",
    sources: ["resume-2026-09", "jobpilot-repo"],
    relatedProjects: ["jobpilot"],
    followUps: ["jobpilot", "jobpilot-stack"],
  },
  {
    id: "jobpilot-sources",
    known: true,
    question: "Which job boards does JobPilot search?",
    variants: [
      "Where does JobPilot get jobs from?",
      "Does JobPilot work with LinkedIn?",
    ],
    answer:
      "RemoteOK through its API, plus JobStreet, OnlineJobs.ph and LinkedIn through the user's own logged-in browser session. It also spots the same job posted on more than one board.",
    sources: ["jobpilot-repo"],
    relatedProjects: ["jobpilot"],
    keywords: ["RemoteOK", "JobStreet", "OnlineJobs.ph"],
    followUps: ["jobpilot-submit", "jobpilot"],
  },

  // Thesis
  {
    id: "thesis",
    known: true,
    question: "What was James's thesis about?",
    variants: [
      "What is the traffic signal project?",
      "Describe James's undergraduate research",
      "What did James research in college?",
    ],
    answer:
      "Teaching traffic lights to react to real traffic. It was a three-person undergraduate group thesis at Ateneo de Davao University: the team trained a deep reinforcement learning agent (a Dueling Double DQN) to control the signals at real Davao City intersections, simulated in SUMO, and compared it with ordinary fixed-time signals. The thesis reports improved traffic flow over fixed-time control. James's role was Researcher & Developer.",
    sources: ["thesis-writeup", "thesis-repo", "confirmed-by-james"],
    relatedProjects: ["traffic-signal-rl"],
    followUps: ["thesis-own-part", "thesis-method", "thesis-intersections"],
  },
  {
    id: "thesis-team",
    known: true,
    question: "Did James do his thesis alone?",
    variants: [
      "Was the thesis a solo project?",
      "How many people worked on the thesis?",
      "Was it a group thesis?",
    ],
    answer:
      "No, it was a three-person group thesis. James's role was Researcher & Developer, and he has described his own part in detail if you'd like to know what he personally did.",
    sources: ["thesis-writeup", "confirmed-by-james"],
    relatedProjects: ["traffic-signal-rl"],
    followUps: ["thesis-own-part", "thesis"],
  },
  {
    id: "thesis-own-part",
    known: true,
    question: "Which parts of the thesis did James personally build?",
    variants: [
      "What was James's role in the thesis?",
      "What did James contribute to the thesis?",
      "Which part of the thesis was his work?",
    ],
    answer:
      "According to James: the research thinking and the thesis papers, all of the development including the whole SUMO simulation, and the fieldwork of recording traffic video and annotating it. The thesis itself was still a three-person group project.",
    sources: ["confirmed-by-james"],
    relatedProjects: ["traffic-signal-rl"],
    followUps: ["thesis-method", "thesis-framework"],
  },
  {
    id: "thesis-framework",
    known: true,
    question: "Which machine learning framework did the thesis use?",
    variants: [
      "Did the thesis use PyTorch or TensorFlow?",
      "What deep learning library did the thesis use?",
    ],
    answer:
      "James says the model work used PyTorch. If you open the public repository, though, the agent code there imports TensorFlow, so that's what you'll see in the code.",
    sources: ["confirmed-by-james", "thesis-repo"],
    relatedProjects: ["traffic-signal-rl"],
    followUps: ["thesis-repo", "thesis-method"],
  },
  {
    id: "thesis-intersections",
    known: true,
    question: "Which intersections did the thesis model?",
    variants: [
      "Where was the thesis simulation set?",
      "What data did the thesis use?",
      "Which roads were simulated?",
    ],
    answer:
      "Real ones in Davao City, including Ecoland and Sandawa, with their vehicle flows, signal phases and layouts rebuilt in SUMO. The traffic counts were collected in the field and processed from 198 raw spreadsheets into 66 simulation scenarios.",
    sources: ["thesis-writeup", "thesis-repo"],
    relatedProjects: ["traffic-signal-rl"],
    keywords: ["Ecoland", "Sandawa"],
    followUps: ["thesis-method", "thesis-own-part"],
  },
  {
    id: "thesis-method",
    known: true,
    question: "How did the thesis agent work?",
    variants: [
      "What algorithm did the thesis use?",
      "How was the thesis model trained?",
      "What was the reward function in the thesis?",
    ],
    answer:
      "The agent watched each intersection's vehicle density, queue lengths and current signal phase, and its moves were phase changes. It was rewarded for cutting waiting time, queues and congestion, and later also for passenger throughput, with a bonus for buses and jeepneys, so it counted people as well as cars. Under the hood it was a Dueling Double DQN with experience replay, trained through SUMO's TraCI Python API, and the results were compared with a fixed-time baseline using 95% confidence intervals.",
    sources: ["thesis-writeup", "thesis-repo"],
    relatedProjects: ["traffic-signal-rl"],
    keywords: ["DQN", "TraCI", "experience replay", "epsilon-greedy"],
    followUps: ["thesis-framework", "thesis-intersections"],
  },
  {
    id: "thesis-teammates",
    known: true,
    question: "Who were James's thesis teammates?",
    variants: [
      "Who did James work with on the thesis?",
      "Who else was in James's thesis group?",
    ],
    answer: `Their names aren't shared here. It was a three-person group project, and if you'd like to know more, you can ask James directly at ${EMAIL}.`,
    sources: ["thesis-writeup", "confirmed-by-james"],
    relatedProjects: ["traffic-signal-rl"],
    followUps: ["thesis-own-part"],
  },
  {
    id: "thesis-repo",
    known: true,
    question: "Where is the thesis code?",
    variants: ["Is the thesis open source?", "Can I see the thesis on GitHub?"],
    answer:
      "It's public on GitHub: [Thesis-TrafficRL](https://github.com/glennzyboi/Thesis-TrafficRL). One thing to know before you look: James says the model work used PyTorch, but the agent code in that repository imports TensorFlow.",
    sources: ["thesis-repo", "confirmed-by-james"],
    relatedProjects: ["traffic-signal-rl"],
    followUps: ["thesis-framework", "thesis"],
  },
  {
    id: "thesis-results",
    known: false,
    question: "What were the thesis's final results?",
    variants: [
      "How much did the thesis reduce waiting time?",
      "What numbers did the thesis report?",
    ],
    answer: null,
  },

  // ADTO
  {
    id: "adto",
    known: true,
    question: "What is ADTO?",
    variants: [
      "Tell me about ADTO",
      "What did James build for ADTO?",
      "What is the event booking platform?",
    ],
    answer:
      "ADTO is a campus-wide event booking platform at Ateneo de Davao University, built within SAMAHAN Systems Development and split into separate admin, client and backend applications. James's documented work on it is the payment integration: he connected PayMongo, including the webhook callbacks, reconciling payment states, and the failure paths around both. It's an internal university system, so its other internals aren't covered here.",
    sources: ["resume-2026-09", "adto-codebase"],
    relatedProjects: ["adto"],
    followUps: ["payments", "sysdev"],
  },

  /* ---------------------------------------------------------------- */
  /* Work history                                                      */
  /* ---------------------------------------------------------------- */
  {
    id: "sysdev",
    known: true,
    question: "What did James do at SYSDEV?",
    variants: [
      "What was James's role at SAMAHAN?",
      "Tell me about his job at the university",
      "What is SAMAHAN Systems Development?",
    ],
    answer:
      "He was a Full Stack Developer at SAMAHAN Systems Development (SYSDEV), Ateneo de Davao University, from January 2025 to May 2026, on-site in Davao City. Much of the work was taking manual coordination out of event approval, registration and ticketing by connecting internal systems through APIs. He built REST APIs, multi-role authorization and PostgreSQL schemas for university-wide systems, and integrated PayMongo into the ADTO booking platform. He also ran daily standups, reviewed pull requests and helped newer members.",
    sources: ["resume-2026-09", "confirmed-by-james"],
    followUps: ["adto", "leadership", "experience"],
  },
  {
    id: "symph",
    known: true,
    question: "What did James do at Symph?",
    variants: [
      "What is Lesson Planner?",
      "Tell me about James's Symph internship",
      "What was James's role at Symph?",
      "What did he work on in Cebu?",
    ],
    answer:
      "He was a Web Developer Intern at Symph in Cebu City from August 2025 to January 2026, working inside an existing production codebase and release process. He shipped features to [Lesson Planner](https://www.lessonplanner.org/v2), an AI lesson-planning platform with a reported user base of 645,000+ educators, and set up Google Cloud build and deploy workflows that removed manual release steps.",
    sources: ["resume-2026-09"],
    followUps: ["experience", "devops"],
  },
  {
    id: "orange-bronze",
    known: true,
    question: "What did James do at Orange & Bronze?",
    variants: [
      "Tell me about his O&B internship",
      "What was his role at Orange & Bronze?",
      "Has James worked in fintech?",
      "What Java experience does James have?",
    ],
    answer:
      "He was a Backend Developer Intern at Orange & Bronze Software Labs from May to June 2025, working remotely. It started with an intensive training program in Java, object-oriented design and test-driven development, then moved into backend performance and reliability work on fintech software, reviewed by senior engineers.",
    sources: ["resume-2026-09", "confirmed-by-james"],
    followUps: ["experience", "testing"],
  },

  /* ---------------------------------------------------------------- */
  /* Not on record: these answer with the fixed unknown reply          */
  /* ---------------------------------------------------------------- */
  {
    id: "favourite-language",
    known: false,
    question: "What is James's favourite programming language?",
    variants: [
      "Which language does James like best?",
      "What is his preferred programming language?",
    ],
    answer: null,
  },
  {
    id: "weakness",
    known: false,
    question: "What is James's biggest weakness?",
    variants: [
      "What are James's weaknesses?",
      "What does James struggle with?",
    ],
    answer: null,
  },
  {
    id: "strengths",
    known: false,
    question: "What are James's strengths?",
    variants: [
      "What are his greatest strengths?",
      "What makes James stand out?",
    ],
    answer: null,
  },
  {
    id: "hobbies",
    known: false,
    question: "What does James do outside of coding?",
    variants: [
      "What are James's hobbies?",
      "What does James do for fun?",
      "What are his interests outside work?",
    ],
    answer: null,
  },
  {
    id: "hardest-bug",
    known: false,
    question: "What is the hardest bug James has worked on?",
    variants: [
      "What was the toughest problem James faced?",
      "What is the most difficult incident he handled?",
    ],
    answer: null,
  },

  /* ---------------------------------------------------------------- */
  /* About this chat, and privacy                                      */
  /* ---------------------------------------------------------------- */
  {
    id: "greeting",
    known: true,
    question: "Hello",
    variants: [
      "Hi",
      "Hey",
      "Hi there",
      "Good morning",
      "Good afternoon",
      "Good evening",
    ],
    answer:
      "Hi. Ask me anything about James: what he's built, where he's worked, or how he approaches his work.",
    sources: ["confirmed-by-james"],
    followUps: ["what-can-he-do", "projects", "experience"],
  },
  {
    id: "thanks",
    known: true,
    question: "Thanks",
    variants: ["Thank you", "Thanks a lot", "Thx", "Cool, thanks"],
    answer: `You're welcome. If you'd like to talk to James himself, he's at ${EMAIL}.`,
    sources: ["confirmed-by-james"],
    followUps: ["contact", "projects"],
  },
  {
    id: "are-you-james",
    known: true,
    question: "Are you James?",
    variants: [
      "Who are you?",
      "Am I talking to a bot?",
      "Are you an AI?",
      "Are you a real person?",
    ],
    answer: `No, I'm an assistant on James's website. I answer questions about him from his records: his resume, his project write-ups and his own answers. For anything I can't cover, you can reach him at ${EMAIL}.`,
    sources: ["confirmed-by-james"],
    followUps: ["about-james", "what-can-he-do"],
  },
  {
    id: "phone",
    known: true,
    question: "What is James's phone number?",
    variants: [
      "Can I call James?",
      "Does James have WhatsApp?",
      "What is his mobile number?",
    ],
    answer: `His phone number isn't shared here. The way to reach him is email: ${EMAIL}.`,
    sources: ["confirmed-by-james"],
    followUps: ["contact", "links"],
  },
  {
    id: "address",
    known: true,
    question: "What is James's home address?",
    variants: [
      "What is his street address?",
      "What is James's mailing address?",
    ],
    answer: `That isn't shared here. He's based in Davao City, Philippines, and you can reach him by email at ${EMAIL}.`,
    sources: ["resume-2026-09", "confirmed-by-james"],
    followUps: ["contact"],
  },
] satisfies Faq[];
