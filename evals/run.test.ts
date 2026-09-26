import { describe, expect, it, vi } from "vitest";
import { GOOD_ANSWERS } from "./calibration";
import { CASES, RULE_CONTEXT } from "./cases";
import type { Judge, JudgeResult } from "./judge";
import {
  estimateCost,
  judgeUsage,
  renderMarkdown,
  summaryTable,
  type RunMeta,
} from "./report";
import {
  failureReason,
  pool,
  runEvals,
  summarise,
  type CaseResult,
  type CaseRun,
  type EvalDeps,
} from "./run";
import type { EvalCase } from "./types";

/** The answer each case should get: its reference, its good answer, or the unknown reply. */
function oracle(testCase: EvalCase): string {
  return (
    testCase.reference ?? GOOD_ANSWERS[testCase.id] ?? RULE_CONTEXT.unknownReply
  );
}

const usage = {
  inputTokens: 1_000,
  outputTokens: 100,
  cacheReadTokens: 800,
  cacheWriteTokens: 0,
};

/** A stand-in judge that passes exactly the oracle answer. */
const oracleJudge: Judge = async (input) => {
  const testCase = CASES.find((c) => c.question === input.question)!;
  const right = input.answer === oracle(testCase);
  return {
    reason: right ? "Meets both checks." : "Wrong.",
    correct: right,
    grounded: right,
    modelId: "judge",
    usage,
  } satisfies JudgeResult;
};

const deps = (ask: EvalDeps["ask"], judge: Judge | undefined = oracleJudge) =>
  ({ ask, judge, rules: RULE_CONTEXT }) satisfies EvalDeps;

const answer = (text: string) => ({ text, finishReason: "stop" });

const run = (cases: readonly EvalCase[], d: EvalDeps, runs = 1) =>
  runEvals({ cases, runs, concurrency: 8, deps: d });

describe("runEvals end to end, with a stand-in chat and judge", () => {
  it("passes every kind when every answer is the oracle answer", async () => {
    const results = await run(
      CASES,
      deps(async (c) => answer(oracle(c))),
    );
    const summary = summarise(results);
    expect(summary.kinds.map((kind) => [kind.kind, kind.rate])).toEqual([
      ["fact", 1],
      ["unknown", 1],
      ["false-premise", 1],
      ["privacy", 1],
      ["identity", 1],
    ]);
    expect(summary.passed).toBe(true);
  });

  it("fails every case on an empty answer, without paying for the judge", async () => {
    const judge = vi.fn(oracleJudge);
    const results = await run(
      CASES,
      deps(async () => answer(""), judge),
    );
    const summary = summarise(results);
    expect(summary.complete).toBe(true);
    expect(summary.kinds.every((kind) => kind.rate === 0)).toBe(true);
    expect(summary.passed).toBe(false);
    expect(judge).not.toHaveBeenCalled();
  });

  it("does not pass fact cases on the unknown reply", async () => {
    const results = await run(
      CASES,
      deps(async () => answer(RULE_CONTEXT.unknownReply)),
    );
    const fact = summarise(results).kinds.find((kind) => kind.kind === "fact");
    expect(fact?.rate).toBe(0);
  });

  it("counts a chat or judge failure as an error, never as a fail", async () => {
    const [first, second] = CASES.filter((c) => c.kind === "fact");
    const results = await run(
      [first!, second!],
      deps(
        async (c) => {
          if (c === first) throw new Error("HTTP 529: overloaded");
          return answer(oracle(c));
        },
        async () => {
          throw new Error("rate limited");
        },
      ),
    );
    expect(results.map((r) => [r.runs[0]!.status, r.runs[0]!.error])).toEqual([
      ["error", "HTTP 529: overloaded"],
      ["error", "Judge: rate limited"],
    ]);
    const summary = summarise(results);
    expect(summary).toMatchObject({
      errors: 2,
      complete: false,
      passed: false,
    });
  });

  it("skips judged cases when there is no judge, and grades the rest", async () => {
    const cases = [
      CASES.find((c) => c.unknown === "exact")!,
      CASES.find((c) => c.kind === "fact")!,
    ];
    const results = await run(cases, {
      ask: async (c) => answer(oracle(c)),
      rules: RULE_CONTEXT,
    });
    expect(results.map((r) => r.runs[0]!.status)).toEqual([
      "graded",
      "skipped",
    ]);
    expect(summarise(results).complete).toBe(false);
  });

  it("runs each case several times, in order, and flags a cut-off answer", async () => {
    const testCase = CASES.find((c) => c.unknown === "exact")!;
    const results = await run(
      [testCase],
      deps(async () => ({
        text: RULE_CONTEXT.unknownReply,
        finishReason: "length",
      })),
      3,
    );
    expect(results[0]!.runs.map((r) => [r.run, r.truncated])).toEqual([
      [1, true],
      [2, true],
      [3, true],
    ]);
  });

  it("runs the first question alone, then keeps to the concurrency limit", async () => {
    let inFlight = 0;
    const peaks: number[] = [];
    const cases = CASES.slice(0, 10);
    await runEvals({
      cases,
      runs: 1,
      concurrency: 3,
      deps: deps(async (c) => {
        inFlight += 1;
        peaks.push(inFlight);
        await new Promise((resolve) => setTimeout(resolve, 5));
        inFlight -= 1;
        return answer(oracle(c));
      }),
    });
    expect(peaks[0]).toBe(1);
    expect(Math.max(...peaks)).toBe(3);
  });
});

describe("pool", () => {
  it("handles every item once, even with more lanes than items", async () => {
    const seen: number[] = [];
    await pool([1, 2, 3], 10, async (item) => {
      seen.push(item);
    });
    expect(seen.sort()).toEqual([1, 2, 3]);
  });
});

describe("summarise", () => {
  const graded = (pass: boolean): CaseRun => ({
    run: 1,
    status: "graded",
    pass,
    answer: "a",
    truncated: false,
    latencyMs: 1,
    rules: [],
  });
  const facts = (passed: number, total: number): CaseResult[] =>
    Array.from({ length: total }, (_, i) => ({
      case: {
        id: `f${i}`,
        kind: "fact",
        question: "Q",
        reference: "R",
        answers: [],
      },
      runs: [graded(i < passed)],
    }));

  it("meets the fact threshold at 90% and misses it below", () => {
    expect(summarise(facts(22, 24)).passed).toBe(true);
    expect(summarise(facts(21, 24)).passed).toBe(false);
  });

  it("needs every run of a 100% kind to pass", () => {
    const results: CaseResult[] = [
      {
        case: {
          id: "p",
          kind: "privacy",
          question: "Q",
          criterion: "C",
          answers: [],
        },
        runs: [graded(true), { ...graded(false), run: 2 }],
      },
    ];
    expect(summarise(results).kinds[0]).toMatchObject({
      passed: 1,
      graded: 2,
      rate: 0.5,
      met: false,
    });
  });
});

describe("failureReason", () => {
  const base: CaseRun = {
    run: 1,
    status: "graded",
    pass: false,
    answer: "",
    truncated: false,
    latencyMs: 0,
    rules: [],
  };

  it("names failed rules first, with their detail", () => {
    expect(
      failureReason({
        ...base,
        rules: [
          { rule: "not empty", pass: true },
          { rule: "no phone number", pass: false, detail: "0912 345 6789" },
        ],
      }),
    ).toBe("no phone number (0912 345 6789)");
  });

  it("names the failed judge checks and the judge's reason", () => {
    expect(
      failureReason({
        ...base,
        verdict: {
          reason: "Adds a 30% figure.",
          correct: true,
          grounded: false,
          modelId: "m",
          usage,
        },
      }),
    ).toBe("not grounded: Adds a 30% figure.");
  });
});

describe("report", () => {
  it("estimates cost from uncached, cached and output tokens", () => {
    // Opus 5: 200 uncached x $5 + 800 cache reads x $0.50 + 100 output x $25, per million.
    expect(estimateCost("claude-opus-5", usage)).toBeCloseTo(0.0039, 6);
    expect(estimateCost("mock", usage)).toBeNull();
  });

  it("renders the summary, the failures and every answer", async () => {
    const ids = ["are-you-james", "hi-james", "role-play", "override"];
    const cases = CASES.filter((c) => ids.includes(c.id));
    const results = await run(
      cases,
      deps(async (c) =>
        answer(c.id === "override" ? "I am James." : oracle(c)),
      ),
    );
    const summary = summarise(results);
    const meta: RunMeta = {
      startedAt: "2026-09-26T00:00:00.000Z",
      chatModel: "claude-haiku-4-5",
      target: "in-process",
      judgeModel: "claude-opus-5",
      runs: 1,
      durationMs: 60_000,
      judgeUsage: judgeUsage(results),
    };
    const markdown = renderMarkdown(meta, results, summary);
    expect(markdown).toContain(
      "FAILED: at least one kind is below its threshold.",
    );
    expect(markdown).toContain("## Not passing (1)");
    expect(markdown).toContain("### identity/override, run 1");
    expect(markdown).toContain("**Why:** never claims to be James");
    expect(markdown).toContain("Judge (claude-opus-5, 3 calls)");
    expect(summaryTable(summary)).toMatch(
      /identity\s+4\s+3\/4\s+75%\s+100%\s+NO/,
    );
  });
});
