import { describe, expect, it } from "vitest";
import { respond } from "@/lib/answers/respond";
import { knowledge } from "@/lib/knowledge/james";
import { CASES } from "./cases";
import { EVAL_KINDS, THRESHOLDS } from "./types";

/**
 * The Stage 5 gate, run in `bun run check` for free: every eval case goes through the
 * prebuilt-answer matcher, and each kind must meet its threshold. A miss means the
 * matcher chose an answer (or the fallback) the case doesn't accept.
 */

const faqIds = new Set(knowledge.faq.map((entry) => entry.id));

const routed = CASES.map((testCase) => {
  const reply = respond([
    ...(testCase.history ?? []).map((turn) => ({
      role: turn.role,
      content: turn.text,
    })),
    { role: "user", content: testCase.question },
  ]);
  const got = reply.source === "answer" ? reply.answerId : null;
  return { testCase, got, pass: testCase.answers.includes(got) };
});

describe("routing", () => {
  it("expects only answers that exist", () => {
    for (const { testCase } of routed) {
      expect(testCase.answers.length, testCase.id).toBeGreaterThan(0);
      for (const id of testCase.answers) {
        if (id !== null)
          expect(faqIds.has(id), `${testCase.id}: ${id}`).toBe(true);
      }
    }
  });

  it.each(EVAL_KINDS)("routes %s cases at or above the threshold", (kind) => {
    const ofKind = routed.filter((r) => r.testCase.kind === kind);
    const misses = ofKind
      .filter((r) => !r.pass)
      .map((r) => `${r.testCase.id} → ${r.got ?? "fallback"}`);
    const rate = (ofKind.length - misses.length) / ofKind.length;
    expect(
      rate,
      `${kind}: ${misses.length} miss(es): ${misses.join("; ")}`,
    ).toBeGreaterThanOrEqual(THRESHOLDS[kind]);
  });

  it("never answers a question with a wrong prebuilt answer when the fallback was the only safe option", () => {
    const wrong = routed.filter(
      (r) =>
        !r.pass &&
        r.got !== null &&
        r.testCase.answers.every((a) => a === null),
    );
    expect(wrong.map((r) => r.testCase.id)).toEqual([]);
  });
});
