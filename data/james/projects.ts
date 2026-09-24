import type { Project } from "@/lib/knowledge/schema";

export const projects = [
  {
    slug: "moneyapp",
    name: "MoneyApp",
    tagline:
      "A shared-expense platform with a web app and an iOS companion app.",
    collaboration: { kind: "solo" },
    role: "Solo developer",
    start: "2026-01",
    end: null,
    status: "active",
    url: "https://moneyapp.click",
    repoUrl: null,
    stack: [
      "TypeScript",
      "Next.js (App Router)",
      "React",
      "Tailwind CSS",
      "Radix UI",
      "TanStack Query",
      "NestJS (legacy API)",
      "Prisma",
      "PostgreSQL (Supabase)",
      "Resend",
      "Expo",
      "React Native",
      "Turborepo",
      "Bun",
      "Jest",
      "Playwright",
      "Vercel",
      "Render",
    ],
    highlights: [
      {
        text: "Shared-expense platform covering authentication, expense capture, split calculation, settlement tracking, and a running debt ledger, with each state transition persisted so an interrupted workflow can be resumed.",
        sources: ["resume-2026-09"],
      },
      {
        text: "Moved balance aggregation out of application code into PostgreSQL SUM queries, cutting per-request work and keeping computed and stored balances in sync.",
        sources: ["resume-2026-09"],
      },
      {
        text: "Set up transactional email on Resend with a verified sending subdomain, configuring DNS, SPF, and DKIM records and debugging delivery failures down to domain verification.",
        sources: ["resume-2026-09"],
      },
      {
        text: "An iOS companion app built with Expo and React Native keeps an offline outbox. A server-side unique client request id makes replayed requests idempotent.",
        sources: ["moneyapp-readme"],
      },
    ],
    story: {
      context: {
        text: "Groups log shared expenses, each expense fans out into per-member splits, and a running debt ledger shows who owes whom. There is also a per-month dashboard, personal transactions, and quick capture that parses a freeform line into an expense.",
        sources: ["moneyapp-readme"],
      },
      approach: [
        {
          text: "A Turborepo and Bun monorepo. The split math lives in a shared package, so the web and mobile apps compute identical numbers.",
          sources: ["moneyapp-readme"],
        },
        {
          text: "Friends are added by email invite. A tokenised invite link completes the friendship after sign-in.",
          sources: ["moneyapp-readme"],
        },
        {
          text: "In-app notifications are written only after the business transaction commits.",
          sources: ["moneyapp-readme"],
        },
        {
          text: "Sign-in is Google OAuth only, with a JWT kept in an HTTP-only cookie.",
          sources: ["moneyapp-readme"],
        },
      ],
      decisions: [
        {
          text: "MoneyApp tracks settlements rather than processing payments. A split is settled through GCash or cash with proof attached, and the payee has to verify it. Unverified payments stay pending, so a claim alone never clears a debt.",
          sources: ["moneyapp-readme"],
        },
        {
          text: "The backend is mid-migration from a standalone NestJS API on Render to Next.js route handlers on Vercel. NestJS still owns the Prisma schema and migrations during the move.",
          sources: ["moneyapp-readme"],
        },
        {
          text: "Tests are aimed at the parts most likely to cost real money if they break, such as split math and payments: Jest unit and integration tests, Playwright end-to-end tests, and a check for Prisma migration drift.",
          sources: ["moneyapp-readme"],
        },
      ],
      outcome: {
        text: "Live at moneyapp.click and in active development.",
        sources: ["resume-2026-09"],
      },
      reflection: null,
    },
    caveats: [
      "MoneyApp does not process payments. It tracks settlements made through GCash or cash, and the payee verifies each one.",
      "The source code is private. Do not link it or call it open source.",
      "The migration from NestJS to Next.js route handlers is not finished.",
    ],
    sources: ["resume-2026-09", "moneyapp-readme"],
  },
  {
    slug: "jobpilot",
    name: "JobPilot",
    tagline:
      "A local AI agent that finds and scores job postings and prepares applications, then stops before submit.",
    collaboration: { kind: "solo" },
    role: "Solo developer",
    start: "2026",
    end: null,
    status: "active",
    url: null,
    repoUrl: null,
    stack: [
      "Python 3.12",
      "FastAPI",
      "SQLAlchemy (async)",
      "Alembic",
      "SQLite",
      "Playwright",
      "Ollama",
      "Docker",
      "Next.js",
      "React",
    ],
    highlights: [
      {
        text: "Multi-stage pipeline that collects listings from several job platforms, normalizes them into a shared schema, and scores each one against a structured candidate profile.",
        sources: ["resume-2026-09"],
      },
      {
        text: "Runs inference locally through Ollama instead of a hosted API, which removes per-token cost and keeps resume and listing data off third-party servers.",
        sources: ["resume-2026-09"],
      },
      {
        text: "Autofills approved applications in a real browser, then stops. A human always clicks submit.",
        sources: ["jobpilot-repo"],
      },
    ],
    story: {
      context: {
        text: "JobPilot searches job boards, scores each posting against a resume with a local language model, drafts application materials, and autofills the applications a person has approved.",
        sources: ["jobpilot-repo"],
      },
      approach: [
        {
          text: "Listings come from the RemoteOK API, and from JobStreet, OnlineJobs.ph and LinkedIn through the user's own logged-in browser session.",
          sources: ["jobpilot-repo"],
        },
        {
          text: "Postings are scored by a local model served through Ollama (qwen3:8b in the README).",
          sources: ["jobpilot-repo"],
        },
        {
          text: "Duplicate jobs are detected across boards.",
          sources: ["jobpilot-repo"],
        },
      ],
      decisions: [
        {
          text: "Human approval is mandatory, and the tool stops before the final submit.",
          sources: ["jobpilot-repo"],
        },
        {
          text: "It never bypasses CAPTCHA or multi-factor authentication.",
          sources: ["jobpilot-repo"],
        },
        {
          text: "Per-platform daily caps, a circuit breaker and a pause switch limit how much it does on its own.",
          sources: ["jobpilot-repo"],
        },
      ],
      outcome: {
        text: 'In a reliability audit James ran in September 2026, bugs were first reproduced with failing tests and then fixed. The fixes covered broken scraping, a ranking crash, false "submitted" states, approval races, CSRF protection and the Docker setup, and the test suite grew from 93 to roughly 315 tests. This work is on a branch and has not been released.',
        sources: ["jobpilot-repo", "dev-session-notes"],
      },
      reflection: null,
    },
    caveats: [
      "JobPilot uses SQLite, not PostgreSQL.",
      "The reliability audit is unreleased branch work. Describe it as an audit James ran, not as a release.",
      "JobPilot never submits an application by itself.",
      "The resume calls it the Job Search Automation Pipeline.",
    ],
    sources: ["resume-2026-09", "jobpilot-repo", "confirmed-by-james"],
  },
  {
    slug: "traffic-signal-rl",
    name: "Traffic signal control with deep reinforcement learning",
    tagline:
      "Undergraduate group thesis: a Dueling Double DQN agent controlling traffic signals at real Davao City intersections, simulated in SUMO.",
    collaboration: {
      kind: "team",
      size: 3,
      ownContribution:
        "According to James, he did the research thinking and the thesis papers, all of the development including the whole SUMO simulation, and the data collection work of recording traffic video and annotating it.",
    },
    role: "Researcher & Developer",
    start: null,
    end: "2025-11",
    status: "completed",
    url: null,
    repoUrl: "https://github.com/glennzyboi/Thesis-TrafficRL",
    stack: ["Python", "SUMO", "TraCI", "PyTorch"],
    highlights: [
      {
        text: "The team modelled real Davao City intersections in SUMO, including Ecoland and Sandawa, with configured vehicle flows, signal phases and layouts.",
        sources: ["thesis-writeup", "thesis-repo"],
      },
      {
        text: "Field-collected Davao City traffic counts were processed from 198 raw spreadsheets into 66 simulation scenarios.",
        sources: ["thesis-repo"],
      },
      {
        text: "The agent was compared against a fixed-time signal baseline on average waiting time and queue length.",
        sources: ["thesis-writeup", "thesis-repo"],
      },
    ],
    story: {
      context: {
        text: "A three-person undergraduate thesis at Ateneo de Davao University on traffic signal control using deep reinforcement learning, grounded in real intersections in Davao City.",
        sources: ["thesis-writeup", "confirmed-by-james"],
      },
      approach: [
        {
          text: "The state covers vehicle density, queue lengths and the signal phase at each intersection. Actions are phase changes. The reward aims to minimise waiting time, queue length and congestion.",
          sources: ["thesis-writeup", "thesis-repo"],
        },
        {
          text: "A Dueling Double DQN agent with experience replay was trained through the TraCI Python API, using epsilon-greedy exploration and hyperparameter tuning for convergence.",
          sources: ["thesis-writeup", "thesis-repo"],
        },
        {
          text: "The reward was later extended with passenger throughput and a public-transport bonus for buses and jeepneys.",
          sources: ["thesis-repo"],
        },
      ],
      decisions: [
        {
          text: "Results were compared with a fixed-time baseline using 95% confidence intervals.",
          sources: ["thesis-repo"],
        },
        {
          text: "The repository also explores an LSTM variant and hybrid training, 70% offline and 30% online.",
          sources: ["thesis-repo"],
        },
        {
          text: "The literature review drew on about 25 papers on DQN signal control, SUMO and vehicle counting.",
          sources: ["thesis-research-files"],
        },
      ],
      outcome: {
        text: "The thesis reports improved traffic flow compared with fixed-time signal control.",
        sources: ["thesis-writeup"],
      },
      reflection: null,
    },
    caveats: [
      "This was a three-person group thesis. Describe James's own part as he described it, attributed to him, and never call it a solo project.",
      "Do not name teammates.",
      "Do not quote waiting-time, queue or throughput figures. The final results are not available here.",
      "The adviser and the defense outcome are unknown.",
      "James says the model work used PyTorch, but the public repository's agent code imports TensorFlow. If asked, state both plainly.",
    ],
    sources: ["thesis-writeup", "thesis-repo", "confirmed-by-james"],
  },
  {
    slug: "adto",
    name: "ADTO",
    tagline:
      "A campus-wide event booking platform at Ateneo de Davao University.",
    collaboration: {
      kind: "organization",
      organization: "SAMAHAN Systems Development (SYSDEV)",
    },
    role: "Full Stack Developer",
    start: "2025",
    end: "2025",
    status: null,
    url: null,
    repoUrl: null,
    stack: ["PayMongo"],
    highlights: [
      {
        text: "Integrated PayMongo into ADTO, handling webhook callbacks, payment state reconciliation, and the failure paths around both.",
        sources: ["resume-2026-09"],
      },
      {
        text: "ADTO is split into separate admin, client and backend applications.",
        sources: ["adto-codebase"],
      },
    ],
    story: {
      context: {
        text: "ADTO is a campus-wide event booking platform built within SAMAHAN Systems Development at Ateneo de Davao University.",
        sources: ["resume-2026-09"],
      },
      approach: [
        {
          text: "James integrated PayMongo, covering webhook callbacks, payment state reconciliation, and the failure paths around both.",
          sources: ["resume-2026-09"],
        },
      ],
      decisions: [],
      outcome: null,
      reflection: null,
    },
    caveats: [
      "ADTO is an internal university system. Do not describe its internals beyond the payment integration.",
    ],
    sources: ["resume-2026-09"],
  },
] satisfies Project[];
