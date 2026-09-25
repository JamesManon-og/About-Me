"use client";

import {
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type Ref,
} from "react";
import { LIMITS } from "@/lib/agent/limits";
import { cx } from "@/lib/cx";
import { COPY } from "./copy";
import { ArrowUpIcon, StopIcon } from "./icons";

export type ComposerHandle = {
  focus: () => void;
  clear: () => void;
};

type ComposerProps = {
  ref?: Ref<ComposerHandle>;
  /** True while an answer is on its way. The button becomes Stop. */
  busy: boolean;
  placeholder: string;
  /** Returns false when the question was not sent, so the text is kept. */
  onSend: (text: string) => boolean;
  onStop: () => void;
};

/** Grows with its content up to this height, then scrolls. */
const MAX_HEIGHT_PX = 200;
/** Show the character count from here on. */
const COUNT_FROM = LIMITS.userChars - 100;

/**
 * The question box: a labelled textarea in a pill, with one round button that sends, or
 * stops a streaming answer. It is the same button element in both roles, so keyboard
 * focus is never lost when the state flips.
 */
export function Composer({
  ref,
  busy,
  placeholder,
  onSend,
  onStop,
}: ComposerProps) {
  const [value, setValue] = useState("");
  const textarea = useRef<HTMLTextAreaElement>(null);

  useImperativeHandle(
    ref,
    () => ({
      focus: () => textarea.current?.focus(),
      clear: () => setValue(""),
    }),
    [],
  );

  useLayoutEffect(() => {
    const el = textarea.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, MAX_HEIGHT_PX)}px`;
  }, [value]);

  const empty = value.trim() === "";

  function send() {
    if (busy || empty) return;
    if (onSend(value)) setValue("");
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    // Enter sends, Shift+Enter adds a line. Ignore Enter while an IME is composing.
    if (
      event.key === "Enter" &&
      !event.shiftKey &&
      !event.nativeEvent.isComposing
    ) {
      event.preventDefault();
      send();
    }
  }

  const showCount = value.length >= COUNT_FROM;

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        send();
      }}
      className={cx(
        "flex items-end gap-2 rounded-[1.75rem] border border-line bg-surface py-2 pr-2 pl-5",
        // The caret signals focus inside the pill, so the ring goes on the pill itself.
        "has-[textarea:focus-visible]:outline-2 has-[textarea:focus-visible]:outline-line-strong",
      )}
    >
      <label htmlFor="chat-input" className="sr-only">
        {COPY.inputLabel}
      </label>
      <textarea
        ref={textarea}
        id="chat-input"
        name="question"
        rows={1}
        value={value}
        maxLength={LIMITS.userChars}
        placeholder={placeholder}
        aria-describedby={showCount ? "chat-input-count" : undefined}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={onKeyDown}
        className="min-h-9 flex-1 resize-none self-center bg-transparent py-1.5 leading-6 text-fg placeholder:text-fg-muted focus-visible:outline-none"
      />
      {showCount ? (
        <span
          id="chat-input-count"
          className="self-center text-caption text-fg-muted tabular-nums"
        >
          {value.length.toLocaleString("en")} /{" "}
          {LIMITS.userChars.toLocaleString("en")}
        </span>
      ) : null}
      <button
        type={busy ? "button" : "submit"}
        onClick={busy ? onStop : undefined}
        aria-label={busy ? "Stop answer" : "Send question"}
        aria-disabled={!busy && empty}
        className={cx(
          "flex size-9 shrink-0 items-center justify-center rounded-full bg-fg text-page",
          "transition-opacity duration-(--duration-fast) ease-out",
          "aria-disabled:cursor-not-allowed aria-disabled:opacity-30",
        )}
      >
        {busy ? (
          <StopIcon className="size-5" />
        ) : (
          <ArrowUpIcon className="size-5" />
        )}
      </button>
    </form>
  );
}
