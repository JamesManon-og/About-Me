import { describe, expect, it } from "vitest";
import {
  ContentMetaSchema,
  FactSchema,
  FaqSchema,
  KnowledgeSchema,
  LinkSchema,
  PartialDate,
  collectSourceRefs,
} from "./schema";
import { knowledge } from "./james";

describe("FactSchema", () => {
  it("rejects a fact without a source", () => {
    expect(FactSchema.safeParse({ text: "x", sources: [] }).success).toBe(
      false,
    );
  });

  it("accepts a fact with a source", () => {
    expect(
      FactSchema.safeParse({ text: "x", sources: ["resume-2026-09"] }).success,
    ).toBe(true);
  });
});

describe("PartialDate", () => {
  it.each(["2025", "2025-01", "2025-12"])("accepts %s", (value) => {
    expect(PartialDate.safeParse(value).success).toBe(true);
  });

  it.each(["2025-13", "2025-1", "Jan 2025", "2025-01-01"])(
    "rejects %s",
    (value) => {
      expect(PartialDate.safeParse(value).success).toBe(false);
    },
  );
});

describe("LinkSchema", () => {
  const base = { id: "x", label: "X", kind: "profile", sources: ["s"] };

  it.each(["https://example.com", "mailto:someone@example.com"])(
    "accepts %s",
    (url) => {
      expect(LinkSchema.safeParse({ ...base, url }).success).toBe(true);
    },
  );

  it.each(["http://example.com", "javascript:alert(1)"])(
    "rejects %s",
    (url) => {
      expect(LinkSchema.safeParse({ ...base, url }).success).toBe(false);
    },
  );
});

describe("FaqSchema", () => {
  it("requires sources for a known answer", () => {
    expect(
      FaqSchema.safeParse({ id: "q", known: true, question: "?", answer: "a" })
        .success,
    ).toBe(false);
  });

  it("requires a null answer for an unknown", () => {
    expect(
      FaqSchema.safeParse({
        id: "q",
        known: false,
        question: "?",
        answer: "a guess",
      }).success,
    ).toBe(false);
  });
});

describe("ContentMetaSchema", () => {
  it("requires sources unless the file is a gap", () => {
    expect(
      ContentMetaSchema.safeParse({
        title: "t",
        status: "published",
        sources: [],
      }).success,
    ).toBe(false);
  });

  it("requires a missing note unless the file is published", () => {
    expect(
      ContentMetaSchema.safeParse({ title: "t", status: "gap", sources: [] })
        .success,
    ).toBe(false);
  });
});

describe("KnowledgeSchema cross-references", () => {
  const issueMessages = (value: unknown) =>
    KnowledgeSchema.safeParse(value).error?.issues.map((i) => i.message) ?? [];

  it("rejects an unknown source id", () => {
    const broken = structuredClone(knowledge);
    broken.projects[0]!.highlights[0]!.sources = ["no-such-source"];
    expect(issueMessages(broken)).toContain('Unknown source "no-such-source"');
  });

  it("rejects an unknown related project", () => {
    const broken = structuredClone(knowledge);
    broken.experience[0]!.relatedProjects = ["no-such-project"];
    expect(issueMessages(broken)).toContain(
      'Unknown project "no-such-project"',
    );
  });

  it("rejects an unknown project on an FAQ", () => {
    const broken = structuredClone(knowledge);
    const entry = broken.faq.find((f) => f.known);
    if (!entry?.known) throw new Error("expected a known FAQ");
    entry.relatedProjects = ["no-such-faq-project"];
    expect(issueMessages(broken)).toContain(
      'Unknown project "no-such-faq-project"',
    );
  });

  it("rejects duplicate ids", () => {
    const broken = structuredClone(knowledge);
    broken.projects.push(structuredClone(broken.projects[0]!));
    expect(issueMessages(broken)).toContain('Duplicate id "moneyapp"');
  });
});

describe("collectSourceRefs", () => {
  it("finds nested source ids with their paths", () => {
    const refs = collectSourceRefs({
      a: { sources: ["x"] },
      b: [{ sources: ["y", "z"] }],
    });
    expect(refs).toEqual([
      { path: ["a", "sources", 0], id: "x" },
      { path: ["b", 0, "sources", 0], id: "y" },
      { path: ["b", 0, "sources", 1], id: "z" },
    ]);
  });
});
