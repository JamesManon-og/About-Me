"use client";

import type { ChatStatus } from "ai";
import { useId } from "react";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import type { ChatData, ChatMessage } from "@/lib/chat/message";
import { COPY } from "./copy";
import { AnswerMarkdown } from "./markdown";

export function messageText(message: ChatMessage): string {
  return message.parts
    .map((part) => (part.type === "text" ? part.text : ""))
    .join("");
}

function suggestionsOf(message: ChatMessage): ChatData["suggestions"] | null {
  for (const part of message.parts) {
    if (part.type === "data-suggestions") return part.data;
  }
  return null;
}

type MessageListProps = {
  messages: ChatMessage[];
  status: ChatStatus;
  error: Error | undefined;
  onRetry: () => void;
  /** Asks a suggested question. */
  onAsk: (question: string) => void;
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
  onAsk,
}: MessageListProps) {
  const waiting = status === "submitted";
  const last = messages.at(-1);
  // Chips belong to the latest answer only, once it has finished.
  const suggestions =
    status === "ready" && last?.role === "assistant"
      ? suggestionsOf(last)
      : null;

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
              {message === last && suggestions?.questions.length ? (
                <Suggestions suggestions={suggestions} onAsk={onAsk} />
              ) : null}
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

function Suggestions({
  suggestions,
  onAsk,
}: {
  suggestions: ChatData["suggestions"];
  onAsk: (question: string) => void;
}) {
  const labelId = useId();
  return (
    <div role="group" aria-labelledby={labelId} className="mt-4">
      <p id={labelId} className="mb-2 text-caption text-fg-muted">
        {suggestions.kind === "related" ? COPY.related : COPY.closest}
      </p>
      <div className="flex flex-wrap gap-2">
        {suggestions.questions.map((question) => (
          <Chip key={question} onClick={() => onAsk(question)}>
            {question}
          </Chip>
        ))}
      </div>
    </div>
  );
}
