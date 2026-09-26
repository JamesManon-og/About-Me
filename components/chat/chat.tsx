"use client";

import { useChat } from "@ai-sdk/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Chip } from "@/components/ui/chip";
import type { ChatMessage } from "@/lib/chat/message";
import { markdownToPlainText } from "@/lib/chat/plain-text";
import { cx } from "@/lib/cx";
import { LIMITS } from "@/lib/agent/limits";
import { Composer, type ComposerHandle } from "./composer";
import { COPY } from "./copy";
import { NewChatIcon } from "./icons";
import { MessageList, messageText } from "./message-list";
import { useStickToBottom } from "./use-stick-to-bottom";

/**
 * The whole product: an empty state with one question, then the conversation.
 *
 * The composer keeps the same position in the tree in both states, so it keeps focus
 * and its draft when the first question moves it to the bottom.
 */
export function Chat() {
  const composer = useRef<ComposerHandle>(null);
  const [announcement, setAnnouncement] = useState("");

  // A polite live region only speaks when its text changes, so repeat text gets a
  // trailing no-break space.
  const announce = useCallback((text: string) => {
    setAnnouncement((previous) => (previous === text ? `${text} ` : text));
  }, []);

  const {
    messages,
    sendMessage,
    regenerate,
    stop,
    status,
    error,
    setMessages,
    clearError,
  } = useChat<ChatMessage>({
    throttle: 50,
    onFinish: ({ message, isAbort, isError }) => {
      if (isError) return;
      if (isAbort) return announce(COPY.stopped);
      announce(markdownToPlainText(messageText(message)));
    },
    onError: () => announce(COPY.error),
  });

  const empty = messages.length === 0;
  const busy = status === "submitted" || status === "streaming";
  const pinToBottom = useStickToBottom(messages);

  function send(text: string): boolean {
    const question = text.trim();
    if (!question || busy) return false;
    if (error) clearError();
    pinToBottom();
    void sendMessage({ text: question });
    return true;
  }

  // A shared link such as /?ask=What+is+MoneyApp%3F asks its question once, on arrival.
  // The parameter is then removed, so a reload or a copied URL doesn't ask it again.
  const askedFromLink = useRef(false);
  useEffect(() => {
    if (askedFromLink.current) return;
    askedFromLink.current = true;
    const url = new URL(window.location.href);
    const question = url.searchParams
      .get("ask")
      ?.trim()
      .slice(0, LIMITS.userChars);
    if (!question) return;
    url.searchParams.delete("ask");
    window.history.replaceState(null, "", url);
    send(question);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- runs once, on arrival
  }, []);

  function retry() {
    composer.current?.focus();
    void regenerate();
  }

  function newChat() {
    if (busy) void stop();
    setMessages([]);
    clearError();
    setAnnouncement("");
    composer.current?.clear();
    composer.current?.focus();
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center justify-between gap-4 bg-page px-4">
        <p className="font-semibold">James Manon-og</p>
        {empty ? null : (
          <button
            type="button"
            onClick={newChat}
            className="-mr-2 inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-small font-medium hover:bg-surface"
          >
            <NewChatIcon className="size-5" />
            New chat
          </button>
        )}
      </header>

      <main
        className={cx(
          "mx-auto flex w-full max-w-chat flex-1 flex-col px-4",
          empty && "justify-center pb-[12vh]",
        )}
      >
        <h1
          className={
            empty ? "mb-8 text-center text-title font-semibold" : "sr-only"
          }
        >
          {COPY.question}
        </h1>

        {empty ? null : (
          <MessageList
            messages={messages}
            status={status}
            error={error}
            onRetry={retry}
            onAsk={(question) => {
              // The chips leave with the answer they belong to, so focus moves to the input.
              if (send(question)) composer.current?.focus();
            }}
          />
        )}

        <div className={cx(!empty && "sticky bottom-0 bg-page pb-3")}>
          <Composer
            ref={composer}
            busy={busy}
            placeholder={empty ? COPY.placeholder : COPY.followUpPlaceholder}
            onSend={send}
            onStop={() => void stop()}
          />
          {empty ? (
            <div
              role="group"
              aria-label="Suggested question"
              className="mt-5 flex flex-wrap justify-center gap-2"
            >
              {COPY.suggestions.map((suggestion) => (
                <Chip
                  key={suggestion}
                  onClick={() => {
                    // The chips leave with the empty state, so focus moves to the input.
                    if (send(suggestion)) composer.current?.focus();
                  }}
                >
                  {suggestion}
                </Chip>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-center text-caption text-fg-muted">
              {COPY.disclaimer}
            </p>
          )}
        </div>
      </main>

      {empty ? (
        <footer className="px-4 py-4 text-center text-caption text-fg-muted">
          {COPY.disclaimer}
        </footer>
      ) : null}

      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {announcement}
      </div>
    </div>
  );
}
