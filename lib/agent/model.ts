import { createAnthropic } from "@ai-sdk/anthropic";
import type { LanguageModel, ModelMessage } from "ai";
import { simulateReadableStream } from "ai";
import { MockLanguageModelV4 } from "ai/test";
import type { Env } from "@/lib/env";

/**
 * Picks the model for the chat route.
 *
 * Default: the cheapest current model. The Stage 4 smoke test decides whether it holds;
 * CHAT_MODEL overrides it without a code change.
 */
export const DEFAULT_CHAT_MODEL = "claude-haiku-4-5";

/** A cap on answer length and cost. Answers are asked to stay short anyway. */
export const MAX_OUTPUT_TOKENS = 1_024;

export type ChatModel = {
  model: LanguageModel;
  /** Provider options for the whole call, such as effort. */
  providerOptions?: Record<string, Record<string, string>>;
};

export function chatModel(
  env: Pick<Env, "ANTHROPIC_API_KEY" | "CHAT_MODEL" | "CHAT_MODEL_MOCK">,
): ChatModel | null {
  if (env.CHAT_MODEL_MOCK) return { model: mockChatModel() };
  if (!env.ANTHROPIC_API_KEY) return null;

  const id = env.CHAT_MODEL ?? DEFAULT_CHAT_MODEL;
  const anthropic = createAnthropic({ apiKey: env.ANTHROPIC_API_KEY });
  return {
    model: anthropic(id),
    // Short factual answers: thinking adds cost and latency without helping.
    // Haiku 4.5 does not think unless asked; the newer models get low effort.
    providerOptions:
      id === "claude-haiku-4-5" ? undefined : { anthropic: { effort: "low" } },
  };
}

/* ------------------------------------------------------------------ */
/* Mock model: scripted answers for e2e tests and keyless UI work.     */
/* ------------------------------------------------------------------ */

export const MOCK_ANSWER =
  "This is a **mock answer** from the test model. The real chat answers from James's records once `ANTHROPIC_API_KEY` is set.";

/** A question containing this marker streams slowly, so tests can press Stop mid-answer. */
export const MOCK_SLOW_MARKER = "[slow]";

function lastUserText(prompt: unknown): string {
  if (!Array.isArray(prompt)) return "";
  const last = (prompt as ModelMessage[]).findLast((m) => m.role === "user");
  if (!last) return "";
  if (typeof last.content === "string") return last.content;
  return last.content
    .map((part) => (part.type === "text" ? part.text : ""))
    .join("");
}

function mockChatModel(): LanguageModel {
  return new MockLanguageModelV4({
    doStream: async ({ prompt }) => {
      const slow = lastUserText(prompt).includes(MOCK_SLOW_MARKER);
      const words = slow
        ? Array.from({ length: 120 }, (_, i) => `word${i + 1} `)
        : MOCK_ANSWER.split(/(?<= )/);
      return {
        stream: simulateReadableStream({
          initialDelayInMs: 100,
          chunkDelayInMs: slow ? 250 : 20,
          chunks: [
            { type: "text-start" as const, id: "text-1" },
            ...words.map((delta) => ({
              type: "text-delta" as const,
              id: "text-1",
              delta,
            })),
            { type: "text-end" as const, id: "text-1" },
            {
              type: "finish" as const,
              finishReason: { unified: "stop" as const, raw: undefined },
              usage: {
                inputTokens: {
                  total: 0,
                  noCache: 0,
                  cacheRead: undefined,
                  cacheWrite: undefined,
                },
                outputTokens: {
                  total: words.length,
                  text: words.length,
                  reasoning: undefined,
                },
              },
            },
          ],
        }),
      };
    },
  });
}
