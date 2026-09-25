import type { ContentDoc } from "@/lib/knowledge/content";
import { collaborationLabel, formatDateRange } from "@/lib/knowledge/format";
import type { Fact, Knowledge, Project } from "@/lib/knowledge/schema";

/**
 * Serialises the public knowledge base into one plain-text block for the system prompt.
 *
 * The output must be byte-stable for the same input (no dates, no random order), or
 * prompt caching misses on every request. Unknown fields are written out as "Not on
 * record" so the model sees the gap instead of filling it. Sources are left out; answer
 * cards cite them from Stage 6.
 */

const UNKNOWN = "Not on record.";

const bullet = (text: string) => `- ${text}`;
const facts = (list: Fact[]) => list.map((fact) => bullet(fact.text));

function field(label: string, value: string | null | undefined): string {
  return `${label}: ${value ?? UNKNOWN}`;
}

function profileSection(k: Knowledge): string[] {
  const p = k.profile;
  return [
    "## Profile",
    field("Name", p.name),
    field("Headline", p.headline.text),
    field("Self-description", p.selfDescription?.text),
    field("Location", p.location.text),
    field("Timezone", p.timezone),
    field("Work mode", p.workMode.text),
    field("Public contact email", p.contact.email),
    field("Target roles", p.targetRoles?.join(", ")),
    "Education:",
    ...p.education.map((e) =>
      bullet(`${e.degree}, ${e.school} (${formatDateRange(e.start, e.end)})`),
    ),
    "Currently learning (in progress, not accomplishments):",
    ...facts(p.currentlyLearning),
  ];
}

function experienceSection(k: Knowledge): string[] {
  const lines = ["## Work experience"];
  for (const role of k.experience) {
    lines.push(
      "",
      `### ${role.role}, ${role.organization}`,
      field("Dates", formatDateRange(role.start, role.end)),
      field("Location", role.location),
      field("Work mode", role.workMode),
      "Highlights:",
      ...facts(role.highlights),
    );
  }
  return lines;
}

function leadershipSection(k: Knowledge): string[] {
  const lines = ["## Leadership"];
  for (const item of k.leadership) {
    lines.push(
      "",
      `### ${item.title}, ${item.organization}`,
      field("Dates", formatDateRange(item.start, item.end)),
      ...(item.highlights.length
        ? ["Highlights:", ...facts(item.highlights)]
        : []),
    );
  }
  return lines;
}

function contributionLine(project: Project): string | null {
  const c = project.collaboration;
  if (c?.kind !== "team") return null;
  return field("James's own part", c.ownContribution);
}

function projectSection(project: Project): string[] {
  const { story } = project;
  const contribution = contributionLine(project);
  return [
    "",
    `### ${project.name}`,
    field("Summary", project.tagline),
    field("How it was built", collaborationLabel(project)),
    ...(contribution ? [contribution] : []),
    field("James's role", project.role),
    field(
      "Dates",
      project.start || project.end
        ? formatDateRange(project.start, project.end)
        : null,
    ),
    field("Status", project.status),
    field("Live URL", project.url),
    field("Repository", project.repoUrl),
    field("Stack", project.stack.join(", ") || null),
    "Highlights:",
    ...facts(project.highlights),
    field("Context", story.context.text),
    "Approach:",
    ...facts(story.approach),
    ...(story.decisions.length
      ? ["Decisions:", ...facts(story.decisions)]
      : []),
    field("Outcome", story.outcome?.text),
    field("James's reflection", story.reflection?.text),
    ...(project.caveats.length
      ? [
          "Rules for this project (never contradict these):",
          ...project.caveats.map(bullet),
        ]
      : []),
  ];
}

function skillsSection(k: Knowledge): string[] {
  return [
    "## Skills",
    ...k.skills.map((group) =>
      bullet(`${group.label}: ${group.items.join(", ")}`),
    ),
    "",
    "## Certifications",
    ...k.certifications.map((c) =>
      bullet(`${c.name}, ${c.issuer} (${formatDateRange(c.date, c.date)})`),
    ),
  ];
}

function principlesSection(k: Knowledge): string[] {
  const lines = [
    "## Working principles",
    "Observed principles are patterns seen in his work, not his own words. Describe them as what his work shows, never as his opinions or feelings. Stated principles are his own words.",
  ];
  for (const p of k.principles) {
    lines.push(
      "",
      `### ${p.title} (${p.basis})`,
      p.description,
      "Evidence:",
      ...facts(p.evidence),
    );
  }
  return lines;
}

function faqSection(k: Knowledge): string[] {
  const known = k.faq.filter((f) => f.known);
  const unknown = k.faq.filter((f) => !f.known);
  return [
    "## Answered questions",
    ...known.flatMap((f) => ["", `Q: ${f.question}`, `A: ${f.answer}`]),
    "",
    "## Questions with no answer on record",
    "Reply to these, and to anything like them, with the fixed unknown reply.",
    ...unknown.map((f) => bullet(f.question)),
  ];
}

function linksSection(k: Knowledge): string[] {
  return [
    "## Links",
    "The only URLs you may share.",
    ...k.links.map((link) => bullet(`${link.label}: ${link.url}`)),
  ];
}

function contentSection(docs: ContentDoc[]): string[] {
  const lines = ["## Notes"];
  for (const doc of docs) {
    lines.push("", `### ${doc.meta.title}`);
    if (doc.meta.status === "partial") {
      lines.push(
        `Partial: only what is written here is known.${
          doc.meta.missing ? ` Not on record: ${doc.meta.missing}` : ""
        }`,
      );
    }
    lines.push(doc.body);
  }
  return lines;
}

/** One text block with everything the assistant may say about James. */
export function buildKnowledgeContext(
  knowledge: Knowledge,
  docs: ContentDoc[],
): string {
  const publishable = docs.filter((doc) => doc.meta.status !== "gap");
  return [
    ...profileSection(knowledge),
    "",
    ...experienceSection(knowledge),
    "",
    ...leadershipSection(knowledge),
    "",
    "## Projects",
    ...knowledge.projects.flatMap(projectSection),
    "",
    ...skillsSection(knowledge),
    "",
    ...principlesSection(knowledge),
    "",
    ...faqSection(knowledge),
    "",
    ...linksSection(knowledge),
    "",
    ...contentSection(publishable),
  ].join("\n");
}
