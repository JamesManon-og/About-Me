import { describe, expect, it } from "vitest";
import type { ContentDoc } from "./content";
import { findGaps, findNullFields } from "./gaps";
import { knowledge } from "./james";

describe("findNullFields", () => {
  it("reports nested nulls with id-based paths", () => {
    expect(
      findNullFields({
        a: null,
        b: { c: null, d: 1 },
        items: [{ id: "first", e: null }, { f: null }],
      }),
    ).toEqual(["a", "b.c", "items[first].e", "items[1].f"]);
  });
});

describe("findGaps", () => {
  const content: ContentDoc[] = [
    {
      slug: "done",
      meta: { title: "Done", status: "published", sources: ["s"] },
      body: "x",
    },
    {
      slug: "todo",
      meta: { title: "Todo", status: "gap", sources: [], missing: "Needed" },
      body: "",
    },
  ];
  const gaps = findGaps(knowledge, content);

  it("lists unfinished content with what is missing", () => {
    expect(gaps).toContainEqual({
      where: "content/james/todo.md (gap)",
      detail: "Needed",
    });
    expect(gaps.some((g) => g.where.includes("done.md"))).toBe(false);
  });

  it("lists unknown FAQ answers by question", () => {
    expect(gaps).toContainEqual({
      where: "faq[weakness]",
      detail: "What is James's biggest weakness?",
    });
  });

  it("lists null profile fields", () => {
    expect(gaps.map((g) => g.where)).toContain("profile.targetRoles");
  });

  it("skips missing URLs and source metadata", () => {
    expect(gaps.filter((g) => /url|repoUrl|^sources/i.test(g.where))).toEqual(
      [],
    );
  });

  it("skips the end date of an active project only", () => {
    expect(gaps.map((g) => g.where)).not.toContain("projects[moneyapp].end");

    const finished = structuredClone(knowledge);
    finished.projects[0]!.status = "completed";
    expect(findGaps(finished, []).map((g) => g.where)).toContain(
      "projects[moneyapp].end",
    );
  });
});
