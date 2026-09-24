---
title: Engineering work
status: published
sources: resume-2026-09, moneyapp-readme, jobpilot-repo
---

Most of James's engineering work sits where systems meet: payment providers, email
providers, webhooks, and the workflows that connect internal tools.

**Payments and webhooks.** At SAMAHAN Systems Development he integrated PayMongo into
ADTO, a campus-wide event booking platform. The work covered webhook callbacks, payment
state reconciliation, and the failure paths around both. He also built REST APIs,
multi-role authorization and PostgreSQL schemas for university-wide systems, and replaced
manual coordination in event approval, registration and ticketing with API integrations.

**Production codebases.** At Symph he shipped features to Lesson Planner, an AI
lesson-planning platform with a reported user base of 645,000+ educators, inside an
existing production codebase and release process. He also set up Google Cloud build and
deploy workflows that removed manual release steps.

**Backend correctness.** At Orange & Bronze Software Labs he completed an intensive
training program in Java, object-oriented design and test-driven development, then
worked on backend performance and reliability for fintech software under senior engineer
review.

**His own projects.** In MoneyApp he moved balance aggregation from application code into
PostgreSQL SUM queries, set up transactional email with DNS, SPF and DKIM on a verified
subdomain, and persisted each state transition so an interrupted workflow can be resumed.
In JobPilot he chose local model inference through Ollama, which removes per-token cost
and keeps resume data off third-party servers.

**Testing.** MoneyApp's tests target split math and payments, the parts most likely to
cost real money if they break, with Jest, Playwright and a Prisma migration-drift check.
JobPilot went through a reliability audit in which each bug was reproduced with a
failing test before it was fixed.
