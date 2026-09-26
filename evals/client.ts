import type { ChatMetadata } from "@/lib/chat/message";
import type { EvalCase } from "./types";

/**
 * Asks the chat a case's question the way the browser does: a `useChat` body posted to
 * the route, answered with a UI message stream.
 */

/** The route handler itself (in-process), or fetch to a running server. */
export type ChatHandler = (request: Request) => Promise<Response>;

export type ChatAnswer = {
  text: string;
  /** "length" means the answer hit the output token cap. */
  finishReason: string | undefined;
  /** Which path answered. Absent from servers older than the prebuilt answer set. */
  served?: ChatMetadata;
};

/** Hard ceiling per question. Longer than the route's own 45 s, so the route's fires first. */
export const CASE_TIMEOUT_MS = 90_000;

/** The body `useChat` posts: earlier turns, then the question, as text parts. */
export function chatBody(testCase: Pick<EvalCase, "question" | "history">) {
  const turns = [
    ...(testCase.history ?? []),
    { role: "user" as const, text: testCase.question },
  ];
  return {
    messages: turns.map((turn, index) => ({
      id: `m${index + 1}`,
      role: turn.role,
      parts: [{ type: "text", text: turn.text }],
    })),
  };
}

/** Reads a UI message stream (server-sent events). Throws on an HTTP or stream error. */
export async function readAnswer(response: Response): Promise<ChatAnswer> {
  if (!response.ok) {
    const body = (await response.text()).slice(0, 200);
    throw new Error(`HTTP ${response.status}: ${body}`);
  }
  let text = "";
  let finishReason: string | undefined;
  let served: ChatMetadata | undefined;
  for (const line of (await response.text()).split("\n")) {
    if (!line.startsWith("data: ")) continue;
    const payload = line.slice("data: ".length).trim();
    if (payload === "[DONE]") continue;
    const chunk = JSON.parse(payload) as {
      type: string;
      delta?: string;
      errorText?: string;
      finishReason?: string;
      messageMetadata?: ChatMetadata;
    };
    if (chunk.messageMetadata) served = chunk.messageMetadata;
    if (chunk.type === "text-delta") text += chunk.delta ?? "";
    if (chunk.type === "finish") finishReason = chunk.finishReason;
    if (chunk.type === "error") throw new Error(chunk.errorText ?? "error");
    if (chunk.type === "abort") throw new Error("The stream was aborted.");
  }
  return served ? { text, finishReason, served } : { text, finishReason };
}

export async function ask(
  handler: ChatHandler,
  testCase: Pick<EvalCase, "question" | "history">,
): Promise<ChatAnswer> {
  const request = new Request("http://localhost/api/chat", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(chatBody(testCase)),
    signal: AbortSignal.timeout(CASE_TIMEOUT_MS),
  });
  return readAnswer(await handler(request));
}

/** Sends the request to a running server or deployment instead of the in-process route. */
export function httpHandler(url: string): ChatHandler {
  return async (request) =>
    fetch(url, {
      method: "POST",
      headers: request.headers,
      body: await request.text(),
      signal: request.signal,
    });
}
