/**
 * Matches a visitor's question to a prebuilt answer, without a model.
 *
 * Text becomes a set of content words: lowercased, stopwords dropped, multi-word names and
 * a few synonyms folded into one token, and plural, -ing and -ed endings trimmed. Each
 * answer is scored phrase by phrase (its question and each variant): the share of the
 * visitor's question the phrase explains, weighted by how rare each word is, times the
 * square root of the share of the phrase the question covers. A match must explain most
 * of the question, and a word no answer uses counts against it at full weight, so an
 * unfamiliar name ("Google", "MIT") falls back instead of landing on the nearest wrong
 * answer.
 */

export type MatchEntry = {
  id: string;
  /** The canonical question and its variants. */
  phrases: readonly string[];
  /** Specific names that point to this entry (scored like its words, lower than a phrase). */
  keywords?: readonly string[];
  /**
   * The project token this entry's question is about ("moneyapp"). A question that names
   * no project, with none in the conversation, scores lower against it.
   */
  entity?: string;
};

export type Scored = {
  id: string;
  /** 0 to 1. The best of the entry's phrase and keyword scores. */
  score: number;
  /** Share of the question's weight the winning phrase explains, 0 to 1. */
  coverage: number;
  /** The best single phrasing's score, which breaks ties. */
  phrase: number;
};

/** A match needs both. Tuned on the answer set itself, then checked against evals/cases.ts. */
export const MATCH_THRESHOLDS = { score: 0.55, coverage: 0.65 } as const;

/**
 * Words spread across an entry's phrasings and keywords are weaker evidence than one
 * phrasing that covers the question.
 */
const UNION_FACTOR = 0.8;

/** Applied when an entry is about a project the question doesn't name. */
const MISSING_ENTITY_FACTOR = 0.6;

/**
 * Question words that hint at intent but are often just connectors ("use AI when
 * coding"). They count, lightly.
 */
const LIGHT_TOKENS = new Map([
  ["where", 0.3],
  ["when", 0.3],
  ["who", 0.3],
  ["why", 0.3],
]);

/* ------------------------------------------------------------------ */
/* Words                                                               */
/* ------------------------------------------------------------------ */

/** Multi-word names and fixed expressions, folded before splitting into words. */
const FOLDS: [RegExp, string][] = [
  // Politeness, not a question about "you".
  [/\b(?:can|could|would|will|do|did)\s+you\b/g, " "],
  [/\bmoney\s*app\b/g, " moneyapp "],
  [/\bjob\s*pilot\b/g, " jobpilot "],
  [/\borange\s*(?:&|and)\s*bronze\b|\bo\s*&\s*b\b/g, " orangebronze "],
  [/\bsamahan(?:\s+systems?\s+development)?\b|\bsys\s*dev\b/g, " sysdev "],
  [/\blesson\s*planner\b/g, " lessonplanner "],
  [/\b(?:machine|deep)\s*learning\b/g, " ml "],
  [/\bartificial\s*intelligence\b/g, " ai "],
  [/\bdev\s*ops\b/g, " devops "],
  [/\breact\s*native\b/g, " reactnative "],
  [/\bnext\s*\.?\s*js\b/g, " nextjs "],
  [/\bnode\s*\.?\s*js\b/g, " nodejs "],
  [/\bclaude(?:\s*code)?\b/g, " claudecode "],
  [/\bfull[\s-]*stack\b/g, " fullstack "],
  [/\bjob\s+titles?\b/g, " role "],
  [/\b(?:what|which)\s+year\b/g, " when "],
  [
    /\bfinish(?:ed)?\s+(?:college|school|university|his\s+degree|his\s+studies)\b/g,
    " graduate ",
  ],
  [/\bci\s*\/\s*cd\b/g, " cicd "],
  [/\bui\s*\/\s*ux\b/g, " uiux "],
  [/\btime\s*zone\b/g, " timezone "],
  [/\bopen\s*source\b/g, " opensource "],
  [/\bsource\s*code\b/g, " code "],
  [/\bpull\s*requests?\b/g, " pullrequest "],
  [/\bclass\s*president\b/g, " classpresident "],
  [/\bthese\s+days\b|\bat\s+the\s+moment\b|\bright\s+now\b/g, " now "],
  [/\blike\s+(?:the\s+)?best\b/g, " favourite "],
  [/\bfree\s*time\b|\bfor\s+fun\b/g, " hobby "],
  [/\bfor\s+a\s+living\b/g, " work "],
  [/\bget\s+in\s+touch\b|\breach\s+out\b/g, " contact "],
  [/\bon\s+his\s+own\b|\bby\s+himself\b/g, " alone "],
  // "live" as where someone lives, not "the app is live".
  [/\b(?:he|james|they)\s+(?:currently\s+)?(?:lives?|living)\b/g, " based "],
  [/\b(?:does|do|did)\s+(?:he|james|they)\s+live\b/g, " based "],
];

/** Words that carry no topic. Interrogatives with meaning (where, when, who, why) stay. */
const STOPWORDS = new Set(
  `a an the is are was were be been being am do does did done doing what whats which how
  i im me my mine we our us he hes him his she her they them their it its this that these
  those there here of in on at to for with from by about into over as and or but if so
  than then too can could would should will shall may might must has have had having any
  some all just really very much most more also ever please tell show give know let like
  get got see find info information detail details something anything everything stuff
  thing things kind sort type bit lot quick quickly briefly james jame manon og mr hi hello
  hey okay ok yes no not only one come came go goes went happen happened out
  up still yet already even maybe actually exactly say said share send provide fully
  completely totally entirely wait um uh oh well`.split(/\s+/),
);

/** Inflections and near-synonyms folded into one token. */
const SYNONYMS: Record<string, string> = {};
function synonyms(target: string, words: string): void {
  for (const word of words.split(/\s+/)) SYNONYMS[word] = target;
}
synonyms(
  "based",
  "based located location locate reside resides residing city country",
);
synonyms(
  "study",
  "study studies studied studying school university college degree education graduate graduated graduation",
);
synonyms("contact", "contact reach email mail hire message touch");
synonyms("favourite", "favourite favorite fav prefer prefers preferred");
synonyms("hobby", "hobby hobbies pastime pastimes");
synonyms("salary", "salary salaries compensation wage wages");
synonyms("weakness", "weak weakness weaknesses");
synonyms("strength", "strength strengths strong");
synonyms("phone", "phone cellphone cell telephone whatsapp viber call");
synonyms(
  "certificate",
  "cert certs certificate certificates certification certifications certified course courses",
);
synonyms("test", "test tests tested testing tdd");
synonyms("repo", "repo repos repository repositories codebase");
synonyms(
  "lead",
  "lead leads led leading leader leadership mentor mentored mentoring manage managed",
);
synonyms(
  "build",
  "build builds built building made make makes create created develop developed write wrote written",
);
synonyms("alone", "alone solo himself");
synonyms("own", "own personally");
synonyms("team", "team teams group groups");
synonyms(
  "teammate",
  "teammate teammates groupmate groupmates classmate classmates partner partners",
);
synonyms("now", "now currently current lately recently nowadays today moment");
synonyms("ai", "ai llm llms gpt chatgpt openai anthropic gemini copilot");
synonyms("developer", "dev devs developer developers engineer engineers");
synonyms("role", "role roles title titles position positions");
synonyms("bot", "bot bots chatbot chatbots robot");
synonyms("talk", "talk talking chat chatting speak speaking");
synonyms("company", "company companies employer employers firm firms");
synonyms("intern", "intern interns interned internship internships");
synonyms("project", "project projects");
synonyms("code", "code coding coded program programming");
synonyms("stack", "stack tech technology technologies tool tools toolkit");
synonyms("framework", "framework frameworks library libraries");
synonyms("database", "database databases db");
synonyms("bug", "bug bugs issue issues incident incidents problem problems");
synonyms("hardest", "hardest toughest hard tough difficult");
synonyms("remote", "remote remotely wfh");
synonyms("payment", "pay paid paying payment payments");
synonyms("settle", "settle settled settles settlement settlements");
synonyms("url", "url website site link links");
synonyms("use", "use uses used using");
synonyms("work", "work works worked working experience experiences");
synonyms(
  "auto",
  "auto automatic automatically automate automated automation autonomous autonomously itself",
);
synonyms("live", "live online deployed launched available running");
synonyms("you", "you your yours yourself");
synonyms("thanks", "thanks thank thx ty");

/** Trims plural, -ing and -ed endings. Crude, but applied the same way on both sides. */
export function stem(word: string): string {
  if (word.length <= 3) return word;
  if (word.endsWith("ies") && word.length > 4) return `${word.slice(0, -3)}y`;
  if (/(?:ch|sh|x|z|ss)es$/.test(word)) return word.slice(0, -2);
  if (word.endsWith("s") && !/(?:ss|us|is)$/.test(word)) {
    return word.slice(0, -1);
  }
  if (word.endsWith("ing") && word.length > 5)
    return undouble(word.slice(0, -3));
  if (word.endsWith("ed") && word.length > 4)
    return undouble(word.slice(0, -2));
  return word;
}

function undouble(word: string): string {
  return /([b-df-hj-np-tv-z])\1$/.test(word) && !/(?:ll|ss|zz)$/.test(word)
    ? word.slice(0, -1)
    : word;
}

/** The content words of a question, deduplicated, in order. */
export function tokens(text: string): string[] {
  let normalised = text
    .toLowerCase()
    .replace(/[‘’`]/g, "'")
    .replace(/'s\b/g, "")
    .replace(/\bcan't\b/g, "can not")
    .replace(/\bwon't\b/g, "will not")
    .replace(/n't\b/g, " not")
    .replace(/&/g, " & ");
  for (const [pattern, replacement] of FOLDS) {
    normalised = normalised.replace(pattern, replacement);
  }
  const out = new Set<string>();
  for (const word of normalised.split(/[^a-z0-9]+/)) {
    if (word.length < 2 || STOPWORDS.has(word)) continue;
    const token = SYNONYMS[word] ?? stem(word);
    if (!STOPWORDS.has(token)) out.add(token);
  }
  return [...out];
}

/** Optimal string alignment distance: edits, with a swap of neighbours as one edit. */
function editDistance(a: string, b: string): number {
  const d = Array.from({ length: a.length + 1 }, (_, i) =>
    Array.from({ length: b.length + 1 }, (_, j) =>
      i === 0 ? j : j === 0 ? i : 0,
    ),
  );
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      let best = Math.min(
        d[i - 1]![j]! + 1,
        d[i]![j - 1]! + 1,
        d[i - 1]![j - 1]! + cost,
      );
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        best = Math.min(best, d[i - 2]![j - 2]! + 1);
      }
      d[i]![j] = best;
    }
  }
  return d[a.length]![b.length]!;
}

/** How alike two tokens are: 1 equal, 0.8 same start (graduat/graduate), 0.7 one typo. */
export function similarity(a: string, b: string): number {
  if (a === b) return 1;
  const [short, long] = a.length <= b.length ? [a, b] : [b, a];
  if (
    short.length >= 4 &&
    long.startsWith(short) &&
    long.length - short.length <= 3
  ) {
    return 0.8;
  }
  if (short.length >= 5 && long.length - short.length <= 1) {
    return editDistance(a, b) <= 1 ? 0.7 : 0;
  }
  return 0;
}

/* ------------------------------------------------------------------ */
/* Index and scoring                                                   */
/* ------------------------------------------------------------------ */

type IndexedEntry = {
  id: string;
  phrases: string[][];
  /** Each keyword's tokens. */
  keywords: string[][];
  /** Every token of every phrasing. */
  vocabulary: string[];
  /** Normalised phrases, for exact matches (chips send the question verbatim). */
  exact: Set<string>;
  entity?: string;
};

export type MatchIndex = {
  entries: IndexedEntry[];
  /** Rarity weight per known token. */
  weights: Map<string, number>;
  /** Weight of a word no entry uses: as informative as the rarest known word. */
  unknownWeight: number;
};

/** Lowercase words only, for comparing a question with a phrase verbatim. */
export function exactKey(text: string): string {
  return text
    .toLowerCase()
    .replace(/[‘’`]/g, "'")
    .replace(/[^a-z0-9']+/g, " ")
    .trim();
}

export function buildIndex(entries: readonly MatchEntry[]): MatchIndex {
  const indexed = entries
    .map((entry) => ({
      id: entry.id,
      phrases: entry.phrases.map(tokens).filter((phrase) => phrase.length > 0),
      keywords: (entry.keywords ?? [])
        .map(tokens)
        .filter((keyword) => keyword.length > 0),
      exact: new Set(entry.phrases.map(exactKey)),
      entity: entry.entity,
    }))
    .map((entry) => ({
      ...entry,
      vocabulary: [...new Set(entry.phrases.flat())],
    }));
  const df = new Map<string, number>();
  for (const entry of indexed) {
    const seen = new Set([...entry.phrases.flat(), ...entry.keywords.flat()]);
    for (const token of seen) df.set(token, (df.get(token) ?? 0) + 1);
  }
  const n = indexed.length;
  const weights = new Map(
    [...df].map(([token, count]) => [token, Math.log(1 + n / count)]),
  );
  return { entries: indexed, weights, unknownWeight: Math.log(1 + n) };
}

function bestSimilarity(token: string, pool: Iterable<string>): number {
  let best = 0;
  for (const candidate of pool) {
    best = Math.max(best, similarity(token, candidate));
    if (best === 1) break;
  }
  return best;
}

/** A query token's weight: its own, or the closest known token's for a typo. */
function queryWeight(index: MatchIndex, token: string): number {
  const exact = index.weights.get(token);
  if (exact !== undefined) return exact;
  let weight = index.unknownWeight;
  let best = 0;
  for (const [known, w] of index.weights) {
    const s = similarity(token, known);
    if (s > best) {
      best = s;
      weight = w;
    }
  }
  return weight;
}

export type MatchOptions = {
  /** Tokens implied by the conversation (the project being discussed). */
  context?: readonly string[];
};

/** Every entry's score for the question, best first. */
export function rank(
  index: MatchIndex,
  question: string,
  { context = [] }: MatchOptions = {},
): Scored[] {
  const key = exactKey(question);
  const exact = index.entries.find((entry) => entry.exact.has(key));
  const query = tokens(question);
  if (!query.length && !exact) return [];
  const qWeights = query.map(
    (token) => queryWeight(index, token) * (LIGHT_TOKENS.get(token) ?? 1),
  );
  const qTotal = qWeights.reduce((sum, w) => sum + w, 0);
  const weightOf = (token: string) =>
    index.weights.get(token) ?? index.unknownWeight;

  const scored = index.entries.map((entry): Scored => {
    // Verbatim wins outright, including ties with phrases that reduce to the same words.
    if (entry === exact) {
      return { id: entry.id, score: 1, coverage: 1, phrase: 2 };
    }
    let best: Scored = { id: entry.id, score: 0, coverage: 0, phrase: 0 };
    if (!query.length) return best;

    for (const phrase of entry.phrases) {
      const covered = query.reduce(
        (sum, token, i) => sum + qWeights[i]! * bestSimilarity(token, phrase),
        0,
      );
      const coverage = covered / qTotal;
      const pTotal = phrase.reduce((sum, t) => sum + weightOf(t), 0);
      const pCovered = phrase.reduce(
        (sum, t) =>
          sum +
          weightOf(t) * (context.includes(t) ? 1 : bestSimilarity(t, query)),
        0,
      );
      const score = coverage * Math.sqrt(pCovered / pTotal);
      if (score > best.score) {
        best = { id: entry.id, score, coverage, phrase: score };
      }
    }

    // Everything this entry knows about: all its phrasings plus the keywords the question
    // names (at least all but one word of each, so "cloud platform" finds "Google Cloud
    // Platform"). Weaker than a single phrase, so it only decides when no phrase does.
    const named = entry.keywords.filter(
      (keyword) =>
        keyword.filter((t) => query.some((q) => similarity(q, t) > 0)).length >=
        Math.max(1, keyword.length - 1),
    );
    const vocabulary = [...entry.vocabulary, ...named.flat()];
    const covered = query.reduce(
      (sum, token, i) => sum + qWeights[i]! * bestSimilarity(token, vocabulary),
      0,
    );
    const coverage = covered / qTotal;
    const union = coverage * UNION_FACTOR;
    if (union > best.score) best = { ...best, score: union, coverage };
    const entity = entry.entity;
    if (
      entity &&
      !context.includes(entity) &&
      !query.some((token) => similarity(token, entity) > 0)
    ) {
      best = {
        ...best,
        score: best.score * MISSING_ENTITY_FACTOR,
        phrase: best.phrase * MISSING_ENTITY_FACTOR,
      };
    }
    return best;
  });

  return scored.sort((a, b) => b.score - a.score || b.phrase - a.phrase);
}

/** The top-ranked entry if it clears both thresholds, or null. */
export function confident(ranked: readonly Scored[]): Scored | null {
  const [best] = ranked;
  if (!best) return null;
  return best.score >= MATCH_THRESHOLDS.score &&
    best.coverage >= MATCH_THRESHOLDS.coverage
    ? best
    : null;
}

/** The confident match, or null. */
export function match(
  index: MatchIndex,
  question: string,
  options?: MatchOptions,
): Scored | null {
  return confident(rank(index, question, options));
}
