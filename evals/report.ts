import type { TokenUsage } from "./judge";
import {
  failureReason,
  type CaseResult,
  type CaseRun,
  type Summary,
} from "./run";

/** Report text for the console and for evals/results/*.md. */

export type RunMeta = {
  startedAt: string;
  /** The chat model, or "mock", or "unknown" for a remote server. */
  chatModel: string;
  /** "in-process" or the URL tested. */
  target: string;
  judgeModel: string | null;
  runs: number;
  durationMs: number;
  /** Only known in-process, from the route's "[chat] finished" log. */
  chatUsage?: TokenUsage & { requests: number };
  judgeUsage: TokenUsage & { calls: number };
};

/** US$ per million tokens, from the claude-api skill (2026-09). Cache reads 0.1x, 5-minute writes 1.25x. */
const PRICES: Record<string, { input: number; output: number }> = {
  "claude-haiku-4-5": { input: 1, output: 5 },
  "claude-sonnet-5": { input: 2, output: 10 },
  "claude-opus-5": { input: 5, output: 25 },
};

export function estimateCost(model: string, usage: TokenUsage): number | null {
  const price = PRICES[model];
  if (!price) return null;
  const uncached =
    usage.inputTokens - usage.cacheReadTokens - usage.cacheWriteTokens;
  return (
    (uncached * price.input +
      usage.cacheReadTokens * price.input * 0.1 +
      usage.cacheWriteTokens * price.input * 1.25 +
      usage.outputTokens * price.output) /
    1_000_000
  );
}

export function addUsage(total: TokenUsage, usage: TokenUsage): void {
  total.inputTokens += usage.inputTokens;
  total.outputTokens += usage.outputTokens;
  total.cacheReadTokens += usage.cacheReadTokens;
  total.cacheWriteTokens += usage.cacheWriteTokens;
}

export function judgeUsage(
  results: readonly CaseResult[],
): TokenUsage & { calls: number } {
  const total = {
    calls: 0,
    inputTokens: 0,
    outputTokens: 0,
    cacheReadTokens: 0,
    cacheWriteTokens: 0,
  };
  for (const run of results.flatMap((result) => result.runs)) {
    if (!run.verdict) continue;
    total.calls += 1;
    addUsage(total, run.verdict.usage);
  }
  return total;
}

const percent = (rate: number | null) =>
  rate === null ? "n/a" : `${Math.round(rate * 1000) / 10}%`;

export function verdictLine(summary: Summary): string {
  if (summary.passed) return "PASSED: every kind met its threshold.";
  if (!summary.complete) {
    return `INCOMPLETE: ${summary.errors} error(s), ${summary.skipped} skipped. Rerun before reading the rates.`;
  }
  return "FAILED: at least one kind is below its threshold.";
}

export function summaryTable(summary: Summary): string {
  const header = ["Kind", "Cases", "Passed", "Rate", "Needs", "Met"];
  const rows = summary.kinds.map((kind) => [
    kind.kind,
    String(kind.cases),
    `${kind.passed}/${kind.graded}`,
    percent(kind.rate),
    percent(kind.threshold),
    kind.met ? "yes" : "NO",
  ]);
  const widths = header.map((cell, column) =>
    Math.max(cell.length, ...rows.map((row) => row[column]!.length)),
  );
  const line = (cells: string[]) =>
    cells.map((cell, column) => cell.padEnd(widths[column]!)).join("  ");
  return [line(header), ...rows.map(line)].join("\n");
}

export function usageLines(meta: RunMeta): string[] {
  const lines: string[] = [];
  const describe = (
    label: string,
    model: string,
    usage: TokenUsage,
    count: string,
  ) => {
    const cost = estimateCost(model, usage);
    const cacheShare = usage.inputTokens
      ? Math.round((usage.cacheReadTokens / usage.inputTokens) * 100)
      : 0;
    lines.push(
      `${label} (${model}, ${count}): ${usage.inputTokens.toLocaleString("en")} input tokens (${cacheShare}% cache reads, ${usage.cacheWriteTokens.toLocaleString("en")} cache writes), ${usage.outputTokens.toLocaleString("en")} output tokens${cost === null ? "" : `, about $${cost.toFixed(2)}`}`,
    );
  };
  if (meta.chatUsage?.requests === 0) {
    lines.push(
      "Chat: no model calls. Every answer came from the prebuilt set or the fallback.",
    );
  } else if (meta.chatUsage) {
    describe(
      "Chat",
      meta.chatModel,
      meta.chatUsage,
      `${meta.chatUsage.requests} requests`,
    );
  } else {
    lines.push("Chat: token counts are only available in-process.");
  }
  if (meta.judgeModel) {
    describe(
      "Judge",
      meta.judgeModel,
      meta.judgeUsage,
      `${meta.judgeUsage.calls} calls`,
    );
  }
  return lines;
}

const quote = (text: string) =>
  text.trim()
    ? text
        .trim()
        .split("\n")
        .map((line) => `> ${line}`)
        .join("\n")
    : "> (empty)";

function runLabel(run: CaseRun): string {
  if (run.status !== "graded") return run.status.toUpperCase();
  return run.pass ? "PASS" : "FAIL";
}

export function renderMarkdown(
  meta: RunMeta,
  results: readonly CaseResult[],
  summary: Summary,
): string {
  const out: string[] = [
    `# Eval run ${meta.startedAt}`,
    "",
    `- Chat: ${meta.chatModel} (${meta.target})`,
    `- Judge: ${meta.judgeModel ?? "off"}`,
    `- Runs per case: ${meta.runs}`,
    `- Duration: ${(meta.durationMs / 60_000).toFixed(1)} min`,
    `- Result: ${verdictLine(summary)}`,
    "",
    "```",
    summaryTable(summary),
    "```",
    "",
    ...usageLines(meta).map((line) => `- ${line}`),
    "",
  ];

  const notPassing = results.flatMap((result) =>
    result.runs.filter((run) => !run.pass).map((run) => ({ result, run })),
  );
  out.push(`## Not passing (${notPassing.length})`, "");
  for (const { result, run } of notPassing) {
    out.push(
      `### ${result.case.kind}/${result.case.id}, run ${run.run}`,
      "",
      `**Question:** ${result.case.question}`,
      "",
      quote(run.answer),
      "",
      `**Why:** ${failureReason(run)}`,
      "",
    );
  }

  out.push("## All answers", "");
  for (const result of results) {
    out.push(
      `### ${result.case.kind}/${result.case.id}`,
      "",
      `**Question:** ${result.case.question}`,
      "",
    );
    for (const run of result.runs) {
      out.push(
        `**Run ${run.run}: ${runLabel(run)}**${run.truncated ? " (hit the output cap)" : ""}, ${(run.latencyMs / 1000).toFixed(1)} s`,
        "",
        quote(run.answer),
        "",
      );
      if (run.verdict) out.push(`Judge: ${run.verdict.reason}`, "");
      if (!run.pass) out.push(`Why: ${failureReason(run)}`, "");
    }
  }
  return out.join("\n");
}
