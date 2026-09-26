import type { ChatMetadata } from "@/lib/chat/message";
import type { ChatAnswer } from "./client";
import type { Judge, JudgeResult } from "./judge";
import {
  allRules,
  globalRules,
  type RuleContext,
  type RuleResult,
} from "./rules";
import {
  EVAL_KINDS,
  needsJudge,
  THRESHOLDS,
  type EvalCase,
  type EvalKind,
} from "./types";

/**
 * Runs cases against the chat and grades each answer. Every answer must pass the rules
 * applied to all answers. Then:
 * - a prebuilt answer or the fallback passes when it is one the case accepts (routing);
 *   the text itself was approved by James, so no judge is needed;
 * - an answer Claude wrote also passes the case's own rules, then the judge when the case
 *   has a reference or a criterion.
 *
 * A run that never produced a gradable answer (an API error, a timeout, a judge failure)
 * is an "error", never a fail. Errors make the whole run incomplete, so a flaky network
 * can't pass or fail a case.
 */

export type RunStatus = "graded" | "error" | "skipped";

export type CaseRun = {
  run: number;
  status: RunStatus;
  pass: boolean;
  answer: string;
  /** The answer hit the output token cap. Still graded: visitors see the cut answer too. */
  truncated: boolean;
  /** Which path answered, when the server says. */
  served?: ChatMetadata;
  latencyMs: number;
  rules: RuleResult[];
  verdict?: JudgeResult;
  error?: string;
};

export type CaseResult = { case: EvalCase; runs: CaseRun[] };

export type EvalDeps = {
  ask: (testCase: EvalCase) => Promise<ChatAnswer>;
  /** Without a judge, cases that need one are "skipped". */
  judge?: Judge;
  rules: RuleContext;
};

const message = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

export async function gradeRun(
  testCase: EvalCase,
  run: number,
  deps: EvalDeps,
): Promise<CaseRun> {
  const base = { run, answer: "", truncated: false, latencyMs: 0, rules: [] };
  const started = performance.now();
  let reply: ChatAnswer;
  try {
    reply = await deps.ask(testCase);
  } catch (error) {
    return { ...base, status: "error", pass: false, error: message(error) };
  }

  const measured = {
    ...base,
    answer: reply.text,
    truncated: reply.finishReason === "length",
    latencyMs: Math.round(performance.now() - started),
    served: reply.served,
  };

  if (reply.served && reply.served.source !== "model") {
    const got = reply.served.source === "answer" ? reply.served.answerId : null;
    const rules = [
      ...globalRules(reply.text, deps.rules),
      {
        rule: "routes to an accepted answer",
        pass: testCase.answers.includes(got),
        detail: got ?? "fallback",
      },
    ];
    return {
      ...measured,
      rules,
      status: "graded",
      pass: rules.every((rule) => rule.pass),
    };
  }

  const graded = {
    ...measured,
    rules: allRules(testCase, reply.text, deps.rules),
  };
  const rulesPass = graded.rules.every((rule) => rule.pass);

  // A failed rule already fails the run, so the judge isn't paid for.
  if (!needsJudge(testCase) || !rulesPass) {
    return { ...graded, status: "graded", pass: rulesPass };
  }
  if (!deps.judge) return { ...graded, status: "skipped", pass: false };

  try {
    const verdict = await deps.judge({
      question: testCase.question,
      history: testCase.history,
      answer: reply.text,
      reference: testCase.reference,
      criterion: testCase.criterion,
    });
    return {
      ...graded,
      status: "graded",
      pass: verdict.correct && verdict.grounded,
      verdict,
    };
  } catch (error) {
    return {
      ...graded,
      status: "error",
      pass: false,
      error: `Judge: ${message(error)}`,
    };
  }
}

/** Runs `worker` over `items` with at most `limit` in flight. */
export async function pool<T>(
  items: readonly T[],
  limit: number,
  worker: (item: T) => Promise<void>,
): Promise<void> {
  let next = 0;
  const lanes = Array.from(
    { length: Math.max(1, Math.min(limit, items.length)) },
    async () => {
      while (next < items.length) {
        const item = items[next++] as T;
        await worker(item);
      }
    },
  );
  await Promise.all(lanes);
}

export async function runEvals({
  cases,
  runs,
  concurrency,
  deps,
  onRun,
}: {
  cases: readonly EvalCase[];
  runs: number;
  concurrency: number;
  deps: EvalDeps;
  onRun?: (testCase: EvalCase, run: CaseRun) => void;
}): Promise<CaseResult[]> {
  const results: CaseResult[] = cases.map((testCase) => ({
    case: testCase,
    runs: [],
  }));
  const tasks = results.flatMap((result) =>
    Array.from({ length: runs }, (_, index) => ({ result, run: index + 1 })),
  );
  const execute = async ({ result, run }: (typeof tasks)[number]) => {
    const outcome = await gradeRun(result.case, run, deps);
    result.runs.push(outcome);
    onRun?.(result.case, outcome);
  };

  // The first question runs alone, so the prompt cache is written once before the rest read it.
  const [first, ...rest] = tasks;
  if (first) await execute(first);
  await pool(rest, concurrency, execute);

  for (const result of results) result.runs.sort((a, b) => a.run - b.run);
  return results;
}

export type KindSummary = {
  kind: EvalKind;
  cases: number;
  graded: number;
  passed: number;
  /** Passed graded runs over all graded runs; null when nothing was graded. */
  rate: number | null;
  threshold: number;
  met: boolean;
  errors: number;
  skipped: number;
};

export type Summary = {
  kinds: KindSummary[];
  errors: number;
  skipped: number;
  /** Every run was graded: no errors and nothing skipped. */
  complete: boolean;
  /** Complete, and every kind in the run met its threshold. */
  passed: boolean;
};

export function summarise(results: readonly CaseResult[]): Summary {
  const kinds = EVAL_KINDS.flatMap((kind): KindSummary[] => {
    const ofKind = results.filter((result) => result.case.kind === kind);
    if (!ofKind.length) return [];
    const runs = ofKind.flatMap((result) => result.runs);
    const graded = runs.filter((run) => run.status === "graded");
    const passed = graded.filter((run) => run.pass).length;
    const rate = graded.length ? passed / graded.length : null;
    return [
      {
        kind,
        cases: ofKind.length,
        graded: graded.length,
        passed,
        rate,
        threshold: THRESHOLDS[kind],
        met: rate !== null && rate >= THRESHOLDS[kind],
        errors: runs.filter((run) => run.status === "error").length,
        skipped: runs.filter((run) => run.status === "skipped").length,
      },
    ];
  });
  const errors = kinds.reduce((sum, kind) => sum + kind.errors, 0);
  const skipped = kinds.reduce((sum, kind) => sum + kind.skipped, 0);
  const complete = errors === 0 && skipped === 0;
  return {
    kinds,
    errors,
    skipped,
    complete,
    passed: complete && kinds.length > 0 && kinds.every((kind) => kind.met),
  };
}

/** Why a run did not pass, in one line. */
export function failureReason(run: CaseRun): string {
  if (run.status === "error") return `error: ${run.error ?? "unknown"}`;
  if (run.status === "skipped") return "skipped: needs the judge";
  const failed = run.rules.filter((rule) => !rule.pass);
  if (failed.length) {
    return failed
      .map((rule) =>
        rule.detail ? `${rule.rule} (${rule.detail})` : rule.rule,
      )
      .join("; ");
  }
  if (run.verdict) {
    const checks = [
      run.verdict.correct ? null : "not correct",
      run.verdict.grounded ? null : "not grounded",
    ].filter(Boolean);
    return `${checks.join(", ")}: ${run.verdict.reason}`;
  }
  return "failed";
}
