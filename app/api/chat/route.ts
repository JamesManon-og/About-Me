import {
  createUIMessageStreamResponse,
  streamText,
  toUIMessageStream,
  type ToolSet,
} from "ai";
import { systemPrompt } from "@/lib/agent/instructions";
import { chatModel, MAX_OUTPUT_TOKENS } from "@/lib/agent/model";
import { parseChatRequest } from "@/lib/agent/request";
import { respond } from "@/lib/answers/respond";
import { replyStream } from "@/lib/answers/stream";
import type { ChatMessage } from "@/lib/chat/message";
import { env } from "@/lib/env";

// Streams can outlast the default function limit on Vercel.
export const maxDuration = 60;

/**
 * Prebuilt answers first. A question the matcher can't place goes to Claude only when a
 * model is configured; otherwise it gets the fixed unknown reply and the closest questions.
 */
export async function POST(request: Request) {
  const parsed = await parseChatRequest(request);
  if (!parsed.ok) {
    return Response.json({ error: parsed.error }, { status: parsed.status });
  }

  const reply = respond(parsed.messages);
  const chat = reply.source === "fallback" ? chatModel(env) : null;
  if (!chat) {
    return createUIMessageStreamResponse({ stream: replyStream(reply) });
  }

  const result = streamText({
    model: chat.model,
    instructions: {
      role: "system",
      content: systemPrompt(),
      // The rules and knowledge never change between requests, so they are cached.
      providerOptions: { anthropic: { cacheControl: { type: "ephemeral" } } },
    },
    messages: parsed.messages,
    maxOutputTokens: MAX_OUTPUT_TOKENS,
    providerOptions: chat.providerOptions,
    abortSignal: request.signal,
    timeout: { totalMs: 45_000, firstChunkMs: 20_000 },
    onFinish: ({ usage, finishReason }) => {
      // Token counts only, never message content. Used to confirm cache hits.
      console.info("[chat] finished", {
        finishReason,
        inputTokens: usage.inputTokens,
        cacheReadTokens: usage.inputTokenDetails?.cacheReadTokens,
        cacheWriteTokens: usage.inputTokenDetails?.cacheWriteTokens,
        outputTokens: usage.outputTokens,
      });
    },
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream<ToolSet, ChatMessage>({
      stream: result.stream,
      messageMetadata: ({ part }) =>
        part.type === "start" ? { source: "model" } : undefined,
    }),
  });
}
