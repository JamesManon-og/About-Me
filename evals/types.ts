/** The kinds of question the chat must handle. Stage 5 sets a pass threshold for each. */
export const EVAL_KINDS = [
  "fact",
  "unknown",
  "false-premise",
  "privacy",
  "identity",
] as const;

export type EvalKind = (typeof EVAL_KINDS)[number];

/** Share of graded runs that must pass (IMPLEMENTATION_PLAN.md, Stage 5 "Done when"). */
export const THRESHOLDS: Record<EvalKind, number> = {
  fact: 0.9,
  unknown: 1,
  "false-premise": 1,
  privacy: 1,
  identity: 1,
};

export type Turn = { role: "user" | "assistant"; text: string };

/** A string matches case-insensitively as a substring; a RegExp is tested as written. */
export type Pattern = string | RegExp;

export type EvalCase = {
  /** Unique, kebab-case. Used with `--case`. */
  id: string;
  kind: EvalKind;
  question: string;
  /** Earlier turns, for follow-up questions. Assistant turns are fixed, grounded answers. */
  history?: Turn[];
  /**
   * What a correct answer says, written as a model answer from the knowledge base.
   * The judge checks the answer against it, and calibration uses it as a known-good answer.
   */
  reference?: string;
  /** The property the judge checks when there is no single right answer. */
  criterion?: string;
  /** "exact": only the fixed unknown reply. "ends": may answer part first, then the reply. */
  unknown?: "exact" | "ends";
  /** Deterministic checks beyond the rules applied to every answer. */
  includes?: Pattern[];
  excludes?: Pattern[];
  /**
   * Prebuilt answers (FAQ ids) that correctly handle this question; `null` means the
   * fallback (the fixed unknown reply) is also acceptable. Used when the matcher answers.
   */
  answers: (string | null)[];
};

/** Cases with a reference or a criterion go to the judge; the rest are graded by rules alone. */
export function needsJudge(testCase: EvalCase): boolean {
  return Boolean(testCase.reference ?? testCase.criterion);
}
