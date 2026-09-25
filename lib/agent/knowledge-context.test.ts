import { describe, expect, it } from "vitest";
import {
  loadAllContent,
  loadPublishedContent,
  parseContentDoc,
} from "@/lib/knowledge/content";
import {
  findDenylistedTerms,
  findEmails,
  findPhoneNumbers,
} from "@/lib/knowledge/forbidden";
import { knowledge } from "@/lib/knowledge/james";
import { buildKnowledgeContext } from "./knowledge-context";
import { systemPrompt } from "./instructions";

const docs = loadAllContent();
const context = buildKnowledgeContext(knowledge, docs);

describe("buildKnowledgeContext", () => {
  it("is byte-stable, so the prompt cache can hit", () => {
    expect(buildKnowledgeContext(knowledge, loadAllContent())).toBe(context);
  });

  it("includes every project and each project's rules", () => {
    for (const project of knowledge.projects) {
      expect(context).toContain(`### ${project.name}`);
      for (const caveat of project.caveats) expect(context).toContain(caveat);
    }
  });

  it("includes every role and every known FAQ answer", () => {
    for (const role of knowledge.experience) {
      expect(context).toContain(role.organization);
    }
    for (const faq of knowledge.faq) {
      if (faq.known) expect(context).toContain(faq.answer);
    }
  });

  it("lists unknown FAQs as questions without answers", () => {
    const unknown = knowledge.faq.filter((f) => !f.known);
    expect(unknown.length).toBeGreaterThan(0);
    const section = context.split("## Questions with no answer on record")[1];
    for (const faq of unknown) expect(section).toContain(faq.question);
  });

  it("marks unknown fields instead of leaving them out", () => {
    expect(knowledge.profile.targetRoles).toBeNull();
    expect(context).toContain("Target roles: Not on record.");
  });

  it("never includes gap content", () => {
    const gap = parseContentDoc(
      "secret",
      "---\ntitle: Placeholder topic\nstatus: gap\nsources:\nmissing: Everything\n---\nGAP BODY TEXT",
    );
    const withGap = buildKnowledgeContext(knowledge, [...docs, gap]);
    expect(withGap).not.toContain("GAP BODY TEXT");
    expect(withGap).not.toContain("Placeholder topic");
    for (const doc of docs.filter((d) => d.meta.status === "gap")) {
      expect(context).not.toContain(`### ${doc.meta.title}`);
    }
  });

  it("includes published and partial notes, and says what partial ones lack", () => {
    for (const doc of loadPublishedContent()) {
      expect(context).toContain(`### ${doc.meta.title}`);
      if (doc.meta.status === "partial" && doc.meta.missing) {
        expect(context).toContain(`Not on record: ${doc.meta.missing}`);
      }
    }
  });
});

describe("systemPrompt", () => {
  const prompt = systemPrompt();

  it("stays within the size the plan assumes", () => {
    // Haiku 4.5 only caches prompts of 4,096 tokens or more (about 4 characters each),
    // and full-context grounding stops making sense well before 60K characters.
    expect(prompt.length).toBeGreaterThan(20_000);
    expect(prompt.length).toBeLessThan(60_000);
  });

  it("contains no phone number, private name, or email other than the public one", () => {
    expect(findPhoneNumbers(prompt)).toEqual([]);
    expect(findDenylistedTerms(prompt)).toEqual([]);
    expect(new Set(findEmails(prompt))).toEqual(
      new Set([knowledge.profile.contact.email]),
    );
  });
});
