/**
 * Stage 5 evals: asks the chat every case in evals/cases.ts and grades the answers.
 *
 *   bun run eval                            every case once, calling the route in-process
 *   bun run eval --url https://your-site/api/chat   the same cases against a deployment
 *   bun run eval --kind unknown --case google
 *   bun run eval --runs 3                   every case three times; each run must pass
 *   bun run eval --calibrate                check the judge on known answers (needs a key)
 *
 * Free without ANTHROPIC_API_KEY: prebuilt answers and the fallback are graded by rules
 * and routing, with no model involved. With a key, questions nothing matches go to Claude,
 * and those answers are graded by the judge too; that costs money, and the last lines
 * print the token counts and an estimate. CHAT_MODEL picks the chat model in-process.
 * Results go to evals/results/ (gitignored).
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";
import { createAnthropic } from "@ai-sdk/anthropic";
import { buildKnowledgeContext } from "@/lib/agent/knowledge-context";
import { DEFAULT_CHAT_MODEL } from "@/lib/agent/model";
import { env } from "@/lib/env";
import { loadPublishedContent } from "@/lib/knowledge/content";
import { knowledge } from "@/lib/knowledge/james";
import { calibrateOne, calibrationItems } from "@/evals/calibration";
import { CASES, RULE_CONTEXT } from "@/evals/cases";
import { ask, httpHandler, type ChatHandler } from "@/evals/client";
import { createJudge, DEFAULT_JUDGE_MODEL, type Judge } from "@/evals/judge";
import {
  addUsage,
  estimateCost,
  judgeUsage,
  renderMarkdown,
  summaryTable,
  usageLines,
  verdictLine,
  type RunMeta,
} from "@/evals/report";
import {
  failureReason,
  pool,
  runEvals,
  summarise,
  type CaseRun,
} from "@/evals/run";
import { EVAL_KINDS, type EvalCase, type EvalKind } from "@/evals/types";

const JUDGE_MODELS = ["claude-opus-5", "claude-sonnet-5", "claude-haiku-4-5"];
const RESULTS_DIR = path.join(process.cwd(), "evals", "results");

const { values: opts } = parseArgs({
  options: {
    url: { type: "string" },
    runs: { type: "string", default: "1" },
    kind: { type: "string", multiple: true },
    case: { type: "string", multiple: true },
    judge: { type: "string", default: DEFAULT_JUDGE_MODEL },
    concurrency: { type: "string", default: "4" },
    "no-judge": { type: "boolean", default: false },
    calibrate: { type: "boolean", default: false },
    help: { type: "boolean", default: false },
  },
});

function fail(text: string): never {
  console.error(text);
  process.exit(2);
}

function positiveInt(value: string | undefined, name: string): number {
  const number = Number(value);
  if (!Number.isInteger(number) || number < 1) {
    fail(`--${name} must be a whole number of 1 or more.`);
  }
  return number;
}

if (opts.help) {
  const header = readFileSync(new URL(import.meta.url), "utf8").split("*/")[0];
  console.log(header?.replace(/^\/\*\*|^ \* ?/gm, "").trim());
  process.exit(0);
}

const runs = positiveInt(opts.runs, "runs");
const concurrency = positiveInt(opts.concurrency, "concurrency");
// The judge is only needed for answers Claude writes, which need a key anyway.
const judgeModel =
  opts["no-judge"] || !env.ANTHROPIC_API_KEY
    ? null
    : (opts.judge ?? DEFAULT_JUDGE_MODEL);
if (judgeModel && !JUDGE_MODELS.includes(judgeModel)) {
  fail(`--judge must be one of: ${JUDGE_MODELS.join(", ")}.`);
}

function selectCases(): EvalCase[] {
  const kinds = opts.kind ?? [];
  const ids = opts.case ?? [];
  for (const kind of kinds) {
    if (!EVAL_KINDS.includes(kind as EvalKind)) {
      fail(`Unknown kind "${kind}". Kinds: ${EVAL_KINDS.join(", ")}.`);
    }
  }
  for (const id of ids) {
    if (!CASES.some((testCase) => testCase.id === id)) {
      fail(`Unknown case "${id}".`);
    }
  }
  if (!kinds.length && !ids.length) return [...CASES];
  return CASES.filter(
    (testCase) => kinds.includes(testCase.kind) || ids.includes(testCase.id),
  );
}

function makeJudge(): Judge | undefined {
  if (!judgeModel) return undefined;
  const anthropic = createAnthropic({ apiKey: env.ANTHROPIC_API_KEY });
  return createJudge({
    model: anthropic(judgeModel),
    knowledge: buildKnowledgeContext(knowledge, loadPublishedContent()),
    providerOptions:
      judgeModel === "claude-haiku-4-5"
        ? undefined
        : {
            anthropic: {
              effort: "medium",
              // Opus 5: a refused request is re-run on a fallback model. The report
              // records which model served each verdict.
              ...(judgeModel === "claude-opus-5"
                ? { fallbacks: "default" }
                : {}),
            },
          },
  });
}

const stamp = () => new Date().toISOString().replace(/[:.]/g, "-");

function save(name: string, files: Record<string, string>): void {
  mkdirSync(RESULTS_DIR, { recursive: true });
  for (const [extension, body] of Object.entries(files)) {
    const file = path.join(RESULTS_DIR, `${name}.${extension}`);
    writeFileSync(file, body);
    console.log(`Saved ${path.relative(process.cwd(), file)}`);
  }
}

/* ------------------------------------------------------------------ */
/* Calibration: the judge alone, on answers with known verdicts.       */
/* ------------------------------------------------------------------ */

async function calibrate(judge: Judge, model: string): Promise<void> {
  const items = calibrationItems();
  console.log(`Calibrating ${model} on ${items.length} known answers...\n`);
  const started = performance.now();
  const results: Awaited<ReturnType<typeof calibrateOne>>[] = [];
  // The first call writes the judge's prompt cache; the rest read it.
  const [first, ...rest] = items;
  const check = async (item: (typeof items)[number]) => {
    const result = await calibrateOne(judge, item);
    results.push(result);
    const verdict = result.verdict;
    const got = verdict
      ? `correct=${verdict.correct} grounded=${verdict.grounded}`
      : `error: ${result.error}`;
    console.log(`${result.agrees ? "ok   " : "WRONG"}  ${item.label}  ${got}`);
    if (!result.agrees && verdict) console.log(`       ${verdict.reason}`);
  };
  if (first) await check(first);
  await pool(rest, concurrency, check);

  const usage = {
    inputTokens: 0,
    outputTokens: 0,
    cacheReadTokens: 0,
    cacheWriteTokens: 0,
  };
  for (const result of results)
    if (result.verdict) addUsage(usage, result.verdict.usage);
  const agreed = results.filter((result) => result.agrees).length;
  const servedBy = new Set(
    results.flatMap((r) => (r.verdict ? [r.verdict.modelId] : [])),
  );
  const cost = estimateCost(model, usage);

  console.log(`\nAgreed on ${agreed}/${results.length}.`);
  console.log(`Served by: ${[...servedBy].join(", ") || "none"}`);
  console.log(
    `Judge tokens: ${usage.inputTokens.toLocaleString("en")} in (${usage.cacheReadTokens.toLocaleString("en")} cache reads), ${usage.outputTokens.toLocaleString("en")} out${cost === null ? "" : `, about $${cost.toFixed(2)}`}, ${((performance.now() - started) / 1000).toFixed(0)} s`,
  );
  save(`${stamp()}-calibration-${model}`, {
    json: JSON.stringify(
      { model, agreed, total: results.length, usage, results },
      null,
      2,
    ),
  });
  process.exit(agreed === results.length ? 0 : 1);
}

/* ------------------------------------------------------------------ */
/* Eval run.                                                           */
/* ------------------------------------------------------------------ */

/** In-process only: collects the route's "[chat] finished" token log instead of printing it. */
function captureChatUsage(): NonNullable<RunMeta["chatUsage"]> {
  const totals = {
    requests: 0,
    inputTokens: 0,
    outputTokens: 0,
    cacheReadTokens: 0,
    cacheWriteTokens: 0,
  };
  const original = console.info.bind(console);
  console.info = (...args: unknown[]) => {
    if (args[0] !== "[chat] finished") return original(...args);
    const usage = args[1] as Partial<Record<string, number>>;
    totals.requests += 1;
    addUsage(totals, {
      inputTokens: usage.inputTokens ?? 0,
      outputTokens: usage.outputTokens ?? 0,
      cacheReadTokens: usage.cacheReadTokens ?? 0,
      cacheWriteTokens: usage.cacheWriteTokens ?? 0,
    });
  };
  return totals;
}

async function evaluate(judge: Judge | undefined): Promise<void> {
  const cases = selectCases();
  const inProcess = !opts.url;
  const chatModel = !inProcess
    ? "unknown"
    : env.CHAT_MODEL_MOCK
      ? "mock"
      : env.ANTHROPIC_API_KEY
        ? (env.CHAT_MODEL ?? DEFAULT_CHAT_MODEL)
        : "none (prebuilt answers only)";
  if (judgeModel && judgeModel === chatModel) {
    console.warn(`Warning: ${judgeModel} is grading its own answers.\n`);
  }

  let handler: ChatHandler;
  let chatUsage: RunMeta["chatUsage"];
  if (opts.url) {
    handler = httpHandler(opts.url);
  } else {
    chatUsage = captureChatUsage();
    const { POST } = await import("@/app/api/chat/route");
    handler = POST;
  }

  console.log(
    `${cases.length} cases x ${runs} run(s) on ${chatModel} (${opts.url ?? "in-process"}), judge ${judgeModel ?? "off"}\n`,
  );
  const startedAt = new Date().toISOString();
  const started = performance.now();
  const results = await runEvals({
    cases,
    runs,
    concurrency,
    deps: {
      ask: (testCase) => ask(handler, testCase),
      judge,
      rules: RULE_CONTEXT,
    },
    onRun: (testCase: EvalCase, run: CaseRun) => {
      const status = (
        run.status === "graded" ? (run.pass ? "PASS" : "FAIL") : run.status
      )
        .toUpperCase()
        .padEnd(7);
      const where = `${testCase.kind}/${testCase.id}${runs > 1 ? ` #${run.run}` : ""}`;
      const detail = run.pass
        ? `${(run.latencyMs / 1000).toFixed(1)} s`
        : failureReason(run);
      console.log(`${status}  ${where}  ${detail}`);
    },
  });

  const summary = summarise(results);
  const meta: RunMeta = {
    startedAt,
    chatModel,
    target: opts.url ?? "in-process",
    judgeModel,
    runs,
    durationMs: Math.round(performance.now() - started),
    chatUsage,
    judgeUsage: judgeUsage(results),
  };

  console.log(`\n${summaryTable(summary)}\n`);
  for (const line of usageLines(meta)) console.log(line);
  console.log(`\n${verdictLine(summary)}`);
  const name = `${startedAt.replace(/[:.]/g, "-")}-${chatModel.split(" ")[0]}`;
  save(name, {
    json: JSON.stringify({ meta, summary, results }, null, 2),
    md: renderMarkdown(meta, results, summary),
  });
  process.exit(summary.passed ? 0 : 1);
}

const judge = makeJudge();
if (opts.calibrate) {
  if (!judge || !judgeModel) {
    fail("--calibrate needs the judge, which needs ANTHROPIC_API_KEY.");
  }
  await calibrate(judge, judgeModel);
} else {
  await evaluate(judge);
}
