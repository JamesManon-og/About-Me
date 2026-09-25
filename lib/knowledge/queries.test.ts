import { describe, expect, it } from "vitest";
import { knowledge } from "./james";
import {
  faqForProject,
  getProject,
  linksOfKind,
  projectNeighbours,
  sourcesCitedIn,
} from "./queries";

describe("getProject", () => {
  it("finds a project by slug", () => {
    expect(getProject("moneyapp")?.name).toBe("MoneyApp");
  });

  it("returns undefined for an unknown slug", () => {
    expect(getProject("no-such-project")).toBeUndefined();
  });
});

describe("projectNeighbours", () => {
  const slugs = knowledge.projects.map((p) => p.slug);

  it("has no previous project for the first one", () => {
    const { previous, next } = projectNeighbours(slugs[0]!);
    expect(previous).toBeNull();
    expect(next?.slug).toBe(slugs[1]);
  });

  it("has no next project for the last one", () => {
    const { previous, next } = projectNeighbours(slugs.at(-1)!);
    expect(previous?.slug).toBe(slugs.at(-2));
    expect(next).toBeNull();
  });

  it("returns nothing for an unknown slug", () => {
    expect(projectNeighbours("no-such-project")).toEqual({
      previous: null,
      next: null,
    });
  });
});

describe("faqForProject", () => {
  it("returns answered questions linked to the project", () => {
    const ids = faqForProject("traffic-signal-rl").map((f) => f.id);
    expect(ids).toContain("thesis-framework");
    expect(ids).toContain("thesis-team");
  });

  it("never returns a known unknown", () => {
    for (const project of knowledge.projects) {
      for (const entry of faqForProject(project.slug)) {
        expect(entry.known).toBe(true);
        expect(entry.answer).toBeTruthy();
      }
    }
  });
});

describe("sourcesCitedIn", () => {
  it("lists each cited source once, in source-list order", () => {
    const value = [
      { text: "a", sources: ["moneyapp-readme", "resume-2026-09"] },
      { text: "b", sources: ["resume-2026-09"] },
    ];
    expect(sourcesCitedIn(value).map((s) => s.id)).toEqual([
      "resume-2026-09",
      "moneyapp-readme",
    ]);
  });

  it("covers every source a project page cites", () => {
    for (const project of knowledge.projects) {
      const cited = sourcesCitedIn(project).map((s) => s.id);
      for (const id of project.sources) expect(cited).toContain(id);
    }
  });
});

describe("linksOfKind", () => {
  it("returns the public contact address", () => {
    expect(linksOfKind("contact").map((l) => l.url)).toEqual([
      `mailto:${knowledge.profile.contact.email}`,
    ]);
  });
});
