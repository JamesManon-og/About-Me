import {
  createUIMessageStreamResponse,
  streamText,
  toUIMessageStream,
} from "ai";
import { systemPrompt } from "@/lib/agent/instructions";
import { chatModel, MAX_OUTPUT_TOKENS } from "@/lib/agent/model";
import { parseChatRequest } from "@/lib/agent/request";
import { env } from "@/lib/env";

// Streams can outlast the default function limit on Vercel.
export const maxDuration = 60;

export async function POST(request: Request) {
  const parsed = await parseChatRequest(request);
  if (!parsed.ok) {
    return Response.json({ error: parsed.error }, { status: parsed.status });
  }

  const chat = chatModel(env);
  if (!chat) {
    return Response.json(
      { error: "The chat is not available right now." },
      { status: 503 },
    );
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
    stream: toUIMessageStream({ stream: result.stream }),
  });
}
