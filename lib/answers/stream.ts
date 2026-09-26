import { createUIMessageStream } from "ai";
import type { ChatMessage } from "@/lib/chat/message";
import type { Reply } from "./respond";

/**
 * A prebuilt reply as a UI message stream, the same protocol Claude's answers use, so the
 * client handles both the same way. The text arrives in one piece: it already exists, and
 * pretending to type it would only slow the visitor down.
 */
export function replyStream(reply: Reply) {
  return createUIMessageStream<ChatMessage>({
    execute: ({ writer }) => {
      writer.write({
        type: "start",
        messageMetadata:
          reply.source === "answer"
            ? { source: "answer", answerId: reply.answerId }
            : { source: "fallback" },
      });
      writer.write({ type: "text-start", id: "answer" });
      writer.write({ type: "text-delta", id: "answer", delta: reply.text });
      writer.write({ type: "text-end", id: "answer" });
      if (reply.suggestions.length) {
        writer.write({
          type: "data-suggestions",
          data: { kind: reply.suggestionKind, questions: reply.suggestions },
        });
      }
      writer.write({ type: "finish", finishReason: "stop" });
    },
  });
}
