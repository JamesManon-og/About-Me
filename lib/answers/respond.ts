import { unknownReply } from "@/lib/agent/system-prompt";
import { knowledge } from "@/lib/knowledge/james";
import type { Faq } from "@/lib/knowledge/schema";
import {
  buildIndex,
  confident,
  match,
  rank,
  tokens,
  type MatchIndex,
} from "./match";

/**
 * Turns a conversation into a reply from the prebuilt answer set, or a fallback.
 *
 * - A confident match answers with the approved text (or the fixed unknown reply for a
 *   `known: false` entry) plus follow-up questions.
 * - No match: the fixed unknown reply plus the closest questions. The route sends this
 *   to Claude instead when a key is set.
 *
 * Stateless: the topic of a follow-up ("did he build it alone?") is recomputed from the
 * earlier questions in the request.
 */

type Suggestions = {
  /** Questions to offer as chips, as their visible text. */
  suggestions: string[];
  /** "related" after an answer, "closest" after a question it couldn't answer. */
  suggestionKind: "related" | "closest";
};

export type Reply =
  | ({ source: "answer"; answerId: string; text: string } & Suggestions)
  | ({ source: "fallback"; text: string } & Suggestions);

type Turn = { role: string; content: unknown };

const MAX_SUGGESTIONS = 3;
/** Below this, an entry is too far off to offer as a "closest question". */
const SUGGESTION_MIN_SCORE = 0.2;
/** Offered when nothing closer is known: the empty-state question and two broad ones. */
const DEFAULT_SUGGESTIONS = ["what-can-he-do", "projects", "contact"];

/** The token that names each project, so a follow-up can inherit it. */
const PROJECT_TOKENS: Record<string, string> = {
  moneyapp: "moneyapp",
  jobpilot: "jobpilot",
  "traffic-signal-rl": "thesis",
  adto: "adto",
};
const PROJECT_TOKEN_SET = new Set(Object.values(PROJECT_TOKENS));

/** The matcher's index over the answer set. */
export function buildAnswerIndex(faq: readonly Faq[]): MatchIndex {
  return buildIndex(
    faq.map((entry) => ({
      id: entry.id,
      phrases: [entry.question, ...(entry.variants ?? [])],
      keywords: entry.known ? entry.keywords : undefined,
      // An entry is about a project when its own question names it.
      entity: tokens(entry.question).find((t) => PROJECT_TOKEN_SET.has(t)),
    })),
  );
}

export function createResponder({
  faq,
  email,
}: {
  faq: readonly Faq[];
  email: string;
}) {
  const byId = new Map(faq.map((entry) => [entry.id, entry]));
  const index = buildAnswerIndex(faq);
  const fixedReply = unknownReply(email);

  const known = (id: string) => byId.get(id)?.known === true;

  /** Visible questions for the first few usable ids, skipping repeats and answered ones. */
  function suggestions(
    candidates: Iterable<string>,
    exclude: ReadonlySet<string>,
  ): string[] {
    const picked: string[] = [];
    for (const id of candidates) {
      if (picked.length === MAX_SUGGESTIONS) break;
      if (exclude.has(id) || picked.includes(id) || !known(id)) continue;
      picked.push(id);
    }
    return picked.map((id) => byId.get(id)!.question);
  }

  /** Follow-ups for an answer: its own list, else other answers about the same project. */
  function followUpsOf(entry: Faq): string[] {
    if (entry.known && entry.followUps) return entry.followUps;
    const project = entry.known ? entry.relatedProjects?.[0] : undefined;
    if (!project) return [];
    return faq
      .filter((f) => f.known && f.relatedProjects?.includes(project))
      .map((f) => f.id);
  }

  /** The project the conversation is about: from the latest earlier question naming one. */
  function topicOf(earlier: readonly string[]): string | undefined {
    for (const text of [...earlier].reverse()) {
      const hit = match(index, text);
      const entry = hit ? byId.get(hit.id) : undefined;
      if (entry?.known && entry.relatedProjects?.length === 1) {
        return PROJECT_TOKENS[entry.relatedProjects[0]!];
      }
    }
    return undefined;
  }

  return function respond(turns: readonly Turn[]): Reply {
    const questions = turns
      .filter((turn) => turn.role === "user")
      .map((turn) => (typeof turn.content === "string" ? turn.content : ""));
    const current = questions.at(-1) ?? "";
    const earlier = questions.slice(0, -1);

    const answered = earlier.flatMap((text) => match(index, text)?.id ?? []);
    const namesProject = tokens(current).some((t) => PROJECT_TOKEN_SET.has(t));
    const topic = namesProject ? undefined : topicOf(earlier);
    const ranked = rank(index, current, { context: topic ? [topic] : [] });
    const hit = confident(ranked);
    const entry = hit ? byId.get(hit.id) : undefined;

    if (entry) {
      const exclude = new Set([...answered, entry.id]);
      const closest = ranked.slice(1).map((r) => r.id);
      return {
        source: "answer",
        answerId: entry.id,
        text: entry.known ? entry.answer : fixedReply,
        suggestionKind: entry.known ? "related" : "closest",
        suggestions: suggestions(
          entry.known
            ? [...followUpsOf(entry), ...DEFAULT_SUGGESTIONS]
            : [...closest, ...DEFAULT_SUGGESTIONS],
          exclude,
        ),
      };
    }

    const lastAnswered = answered.at(-1);
    const previous = lastAnswered ? byId.get(lastAnswered) : undefined;
    return {
      source: "fallback",
      text: fixedReply,
      suggestionKind: "closest",
      suggestions: suggestions(
        [
          ...ranked
            .filter((r) => r.score >= SUGGESTION_MIN_SCORE)
            .map((r) => r.id),
          ...(previous ? followUpsOf(previous) : []),
          ...DEFAULT_SUGGESTIONS,
        ],
        new Set(answered),
      ),
    };
  };
}

/** The responder for the site, built once from the knowledge base. */
export const respond = createResponder({
  faq: knowledge.faq,
  email: knowledge.profile.contact.email,
});
