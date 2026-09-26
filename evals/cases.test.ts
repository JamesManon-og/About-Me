import { describe, expect, it } from "vitest";
import { LIMITS } from "@/lib/agent/limits";
import { toModelMessages } from "@/lib/agent/request";
import { BAD_ANSWERS, calibrationItems, GOOD_ANSWERS } from "./calibration";
import { CASES, RULE_CONTEXT } from "./cases";
import { chatBody } from "./client";
import { knowledge } from "@/lib/knowledge/james";
import { allRules, globalRules } from "./rules";
import { EVAL_KINDS, needsJudge } from "./types";

const ids = CASES.map((testCase) => testCase.id);
const byId = new Map(CASES.map((testCase) => [testCase.id, testCase]));

describe("eval cases", () => {
  it("has about 40 cases with unique kebab-case ids", () => {
    expect(CASES.length).toBeGreaterThanOrEqual(40);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
  });

  it("covers every kind, with at least 20 fact cases", () => {
    for (const kind of EVAL_KINDS) {
      expect(CASES.some((testCase) => testCase.kind === kind)).toBe(true);
    }
    expect(
      CASES.filter((c) => c.kind === "fact").length,
    ).toBeGreaterThanOrEqual(20);
  });

  it("sends bodies the chat route accepts, ending on the question", () => {
    for (const testCase of CASES) {
      const parsed = toModelMessages(chatBody(testCase));
      expect(parsed.ok, testCase.id).toBe(true);
      if (!parsed.ok) continue;
      expect(parsed.messages.at(-1)).toEqual({
        role: "user",
        content: testCase.question,
      });
      expect(testCase.question.length).toBeLessThanOrEqual(LIMITS.userChars);
    }
  });

  it("gives every case a way to be graded", () => {
    for (const testCase of CASES) {
      if (testCase.kind === "fact") {
        expect(testCase.reference, testCase.id).toBeTruthy();
      } else if (testCase.kind === "unknown") {
        expect(
          testCase.unknown ?? testCase.criterion,
          testCase.id,
        ).toBeTruthy();
      } else {
        expect(testCase.criterion, testCase.id).toBeTruthy();
      }
      expect(
        testCase.reference && testCase.criterion,
        `${testCase.id} has both a reference and a criterion`,
      ).toBeFalsy();
    }
  });

  it("lets every reference answer pass the rules (the rules aren't too strict)", () => {
    for (const testCase of CASES.filter((c) => c.reference)) {
      const failed = allRules(testCase, testCase.reference!, RULE_CONTEXT)
        .filter((rule) => !rule.pass)
        .map((rule) => rule.rule);
      expect(failed, testCase.id).toEqual([]);
    }
  });

  it("fails every exact-unknown case on a made-up answer", () => {
    for (const testCase of CASES.filter((c) => c.unknown === "exact")) {
      const results = allRules(testCase, "He likes Rust.", RULE_CONTEXT);
      expect(
        results.every((rule) => rule.pass),
        testCase.id,
      ).toBe(false);
    }
  });
});

describe("calibration answers", () => {
  it("has a good answer for every case judged by a criterion", () => {
    for (const testCase of CASES.filter((c) => c.criterion)) {
      expect(GOOD_ANSWERS[testCase.id], testCase.id).toBeTruthy();
    }
    for (const id of Object.keys(GOOD_ANSWERS)) {
      expect(byId.get(id)?.criterion, id).toBeTruthy();
    }
  });

  it("lets every good answer pass the rules", () => {
    for (const [id, answer] of Object.entries(GOOD_ANSWERS)) {
      const failed = allRules(byId.get(id)!, answer, RULE_CONTEXT)
        .filter((rule) => !rule.pass)
        .map((rule) => rule.rule);
      expect(failed, id).toEqual([]);
    }
  });

  it("points bad answers at judged cases", () => {
    for (const bad of BAD_ANSWERS) {
      const testCase = byId.get(bad.caseId);
      expect(testCase && needsJudge(testCase), bad.caseId).toBe(true);
    }
  });

  it("checks every judged case once as known-good, plus the known-bad answers", () => {
    const items = calibrationItems();
    const good = items.filter((item) => item.label.startsWith("good: "));
    expect(good).toHaveLength(CASES.filter(needsJudge).length);
    expect(good.every((item) => item.input.answer.length > 0)).toBe(true);
    const bad = items.filter((item) => !item.label.startsWith("good: "));
    expect(
      bad.every((item) => Object.values(item.expect).includes(false)),
    ).toBe(true);
    expect(new Set(items.map((item) => item.label)).size).toBe(items.length);
  });
});

describe("prebuilt answers", () => {
  it("every approved answer passes the rules applied to all answers", () => {
    for (const entry of knowledge.faq) {
      if (!entry.known) continue;
      const failed = globalRules(entry.answer, RULE_CONTEXT)
        .filter((rule) => !rule.pass)
        .map((rule) =>
          rule.detail ? `${rule.rule}: ${rule.detail}` : rule.rule,
        );
      expect(failed, entry.id).toEqual([]);
    }
  });

  it("no answer variant copies an eval question (the evals must stay a test)", () => {
    const evalQuestions = new Set(CASES.map((c) => tokensKey(c.question)));
    for (const entry of knowledge.faq) {
      for (const variant of entry.variants ?? []) {
        expect(
          evalQuestions.has(tokensKey(variant)),
          `${entry.id}: ${variant}`,
        ).toBe(false);
      }
    }
  });
});

function tokensKey(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}
