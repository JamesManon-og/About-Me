import { describe, expect, it } from "vitest";
import { knowledge } from "./james";
import type { Project } from "./schema";
import {
  collaborationLabel,
  dateRange,
  formatDateRange,
  formatPartialDate,
  statusLabel,
} from "./format";

describe("formatPartialDate", () => {
  it.each([
    ["2025", "2025"],
    ["2025-01", "Jan 2025"],
    ["2026-12", "Dec 2026"],
  ])("formats %s as %s", (input, expected) => {
    expect(formatPartialDate(input)).toBe(expected);
  });
});

describe("dateRange", () => {
  it("returns nothing without dates", () => {
    expect(dateRange(null, null)).toEqual([]);
  });

  it("collapses a range that starts and ends in the same period", () => {
    expect(formatDateRange("2025", "2025")).toBe("2025");
  });

  it("shows only the end when the start is unknown", () => {
    expect(dateRange(null, "2025-11")).toEqual([
      { dateTime: "2025-11", label: "Nov 2025" },
    ]);
  });

  it("runs to present when there is no end", () => {
    expect(dateRange("2026-01", null)).toEqual([
      { dateTime: "2026-01", label: "Jan 2026" },
      { dateTime: null, label: "present" },
    ]);
  });

  it("joins a full range with an en dash", () => {
    expect(formatDateRange("2025-01", "2026-05")).toBe("Jan 2025 – May 2026");
  });

  it("formats every date in the knowledge base", () => {
    const ranges = [
      ...knowledge.projects,
      ...knowledge.experience,
      ...knowledge.leadership,
      ...knowledge.profile.education,
    ].map((item) => formatDateRange(item.start, item.end));
    for (const range of ranges) expect(range).not.toMatch(/undefined|NaN/);
  });
});

describe("project labels", () => {
  const base = knowledge.projects[0]!;
  const withCollab = (collaboration: Project["collaboration"]): Project => ({
    ...base,
    collaboration,
  });

  it("describes each kind of collaboration", () => {
    expect(collaborationLabel(withCollab({ kind: "solo" }))).toBe(
      "Solo project",
    );
    expect(
      collaborationLabel(
        withCollab({ kind: "team", size: 3, ownContribution: null }),
      ),
    ).toBe("Group project, 3 people");
    expect(
      collaborationLabel(
        withCollab({ kind: "team", size: null, ownContribution: null }),
      ),
    ).toBe("Group project");
    expect(
      collaborationLabel(
        withCollab({ kind: "organization", organization: "X" }),
      ),
    ).toBe("Built at X");
    expect(collaborationLabel(withCollab(null))).toBeNull();
  });

  it("never calls the thesis a solo project", () => {
    const thesis = knowledge.projects.find(
      (p) => p.slug === "traffic-signal-rl",
    )!;
    expect(collaborationLabel(thesis)).toBe("Group project, 3 people");
  });

  it("labels a status and leaves an unknown one empty", () => {
    expect(statusLabel({ ...base, status: "active" })).toBe("Active");
    expect(statusLabel({ ...base, status: null })).toBeNull();
  });
});
