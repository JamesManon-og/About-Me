import type { UIMessage } from "ai";

/**
 * The chat's message shape, shared by the route and the client. Types only, so it is
 * safe to import from client components.
 */

/** Which path answered: a prebuilt answer (by FAQ id), the fallback, or Claude. */
export type ChatMetadata =
  | { source: "answer"; answerId: string }
  | { source: "fallback" }
  | { source: "model" };

export type ChatData = {
  /**
   * Questions offered as chips under the answer, as their visible text. "related" follows
   * an answer; "closest" follows a question the chat couldn't answer.
   */
  suggestions: { kind: "related" | "closest"; questions: string[] };
};

export type ChatMessage = UIMessage<ChatMetadata, ChatData>;
