import { describe, expect, it } from "vitest";
import { loadAllContent, loadPublishedContent } from "./content";
import { knowledge } from "./james";
import { collectSourceRefs } from "./schema";

/** Every object in the tree that has a `text` field is a fact. */
function collectFacts(value: unknown): { text: string; sources: unknown }[] {
  if (Array.isArray(value)) return value.flatMap(collectFacts);
  if (value === null || typeof value !== "object") return [];
  const record = value as Record<string, unknown>;
  const own =
    typeof record.text === "string"
      ? [{ text: record.text, sources: record.sources }]
      : [];
  return [...own, ...Object.values(record).flatMap(collectFacts)];
}

const EXPECTED_CONTENT = [
  "about",
  "ai-workflow",
  "communication",
  "engineering",
  "goals",
  "interests",
  "leadership",
  "lessons",
  "philosophy",
  "problem-solving",
  "strengths",
  "weaknesses",
];

describe("structured knowledge", () => {
  it("has at least one fact", () => {
    expect(collectFacts(knowledge).length).toBeGreaterThan(20);
  });

  it("gives every fact at least one source", () => {
    const unsourced = collectFacts(knowledge).filter(
      (fact) => !Array.isArray(fact.sources) || fact.sources.length === 0,
    );
    expect(unsourced).toEqual([]);
  });

  it("uses every declared source at least once", () => {
    const used = new Set(collectSourceRefs(knowledge).map((ref) => ref.id));
    for (const doc of loadAllContent()) {
      doc.meta.sources.forEach((id) => used.add(id));
    }
    const unused = knowledge.sources
      .map((s) => s.id)
      .filter((id) => !used.has(id));
    expect(unused).toEqual([]);
  });

  it("lists every project, repository and credential URL in the link allowlist", () => {
    const allowed = new Set(knowledge.links.map((l) => l.url));
    const urls = [
      ...knowledge.projects.flatMap((p) => [p.url, p.repoUrl]),
      ...knowledge.certifications.map((c) => c.credentialUrl),
    ].filter((url): url is string => url !== null);
    for (const url of urls) expect(allowed).toContain(url);
  });

  it("publishes the contact email as a mailto link", () => {
    const allowed = knowledge.links.map((l) => l.url);
    expect(allowed).toContain(`mailto:${knowledge.profile.contact.email}`);
  });

  it("keeps the thesis a three-person team project", () => {
    const thesis = knowledge.projects.find(
      (p) => p.slug === "traffic-signal-rl",
    );
    expect(thesis?.collaboration).toMatchObject({ kind: "team", size: 3 });
  });

  it("attributes James's part of a team project to his own account", () => {
    for (const project of knowledge.projects) {
      const c = project.collaboration;
      if (c?.kind === "team" && c.ownContribution !== null) {
        expect(c.ownContribution, project.slug).toMatch(/^According to James/);
      }
    }
  });
});

describe("prose content", () => {
  const docs = loadAllContent();
  const sourceIds = new Set(knowledge.sources.map((s) => s.id));

  it("has the expected topics", () => {
    expect(docs.map((d) => d.slug)).toEqual(EXPECTED_CONTENT);
  });

  it("references only declared sources", () => {
    const unknown = docs.flatMap((d) =>
      d.meta.sources
        .filter((id) => !sourceIds.has(id))
        .map((id) => `${d.slug}: ${id}`),
    );
    expect(unknown).toEqual([]);
  });

  it("has a body for published and partial topics, and none for gaps", () => {
    for (const doc of docs) {
      if (doc.meta.status === "gap") expect(doc.body, doc.slug).toBe("");
      else expect(doc.body.length, doc.slug).toBeGreaterThan(50);
    }
  });

  it("never hands gap topics to the site or the agent", () => {
    expect(loadPublishedContent().every((d) => d.meta.status !== "gap")).toBe(
      true,
    );
  });
});
