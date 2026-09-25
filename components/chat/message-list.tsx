"use client";

import type { ChatStatus, UIMessage } from "ai";
import { Button } from "@/components/ui/button";
import { COPY } from "./copy";
import { AnswerMarkdown } from "./markdown";

export function messageText(message: UIMessage): string {
  return message.parts
    .map((part) => (part.type === "text" ? part.text : ""))
    .join("");
}

type MessageListProps = {
  messages: UIMessage[];
  status: ChatStatus;
  error: Error | undefined;
  onRetry: () => void;
};

/**
 * The conversation. Answers stream in silently: this list is not a live region. The
 * finished answer is announced once by the chat's separate announcer.
 */
export function MessageList({
  messages,
  status,
  error,
  onRetry,
}: MessageListProps) {
  const waiting = status === "submitted";

  return (
    <section aria-label="Conversation" className="flex-1 pt-4 pb-8">
      <ol className="flex flex-col gap-8">
        {messages.map((message) => {
          const text = messageText(message);
          if (message.role === "user") {
            return (
              <li key={message.id} className="flex justify-end">
                <div className="max-w-[85%] rounded-3xl bg-surface px-4 py-2.5 break-words whitespace-pre-wrap">
                  <span className="sr-only">You: </span>
                  {text}
                </div>
              </li>
            );
          }
          if (!text) return null;
          return (
            <li key={message.id}>
              <span className="sr-only">Answer: </span>
              <AnswerMarkdown text={text} />
            </li>
          );
        })}
        {waiting ? (
          <li>
            <span className="sr-only">Answering</span>
            <span
              aria-hidden="true"
              className="inline-block size-3 rounded-full bg-fg motion-safe:animate-pulse"
            />
          </li>
        ) : null}
      </ol>
      {error ? (
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <p className="text-fg-muted">{COPY.error}</p>
          <Button variant="secondary" onClick={onRetry}>
            Retry
          </Button>
        </div>
      ) : null}
    </section>
  );
}
