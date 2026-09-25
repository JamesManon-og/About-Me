import { describe, expect, it } from "vitest";
import { LIMITS, parseChatRequest, toModelMessages } from "./request";

const user = (text: string) => ({
  id: "u",
  role: "user",
  parts: [{ type: "text", text }],
});
const assistant = (text: string) => ({
  id: "a",
  role: "assistant",
  parts: [{ type: "step-start" }, { type: "text", text }],
});

describe("toModelMessages", () => {
  it("turns UI messages into plain text model messages", () => {
    const result = toModelMessages({
      id: "chat",
      trigger: "submit-message",
      messages: [user("Hi"), assistant("Hello."), user(" What has he built? ")],
    });
    expect(result).toEqual({
      ok: true,
      messages: [
        { role: "user", content: "Hi" },
        { role: "assistant", content: "Hello." },
        { role: "user", content: "What has he built?" },
      ],
    });
  });

  it("drops every part that is not text", () => {
    const result = toModelMessages({
      messages: [
        {
          role: "user",
          parts: [
            { type: "file", url: "data:text/plain;base64,aGk=" },
            { type: "text", text: "Question" },
          ],
        },
      ],
    });
    expect(result).toEqual({
      ok: true,
      messages: [{ role: "user", content: "Question" }],
    });
  });

  it("accepts a question at the limit and rejects one over it", () => {
    const at = "a".repeat(LIMITS.userChars);
    expect(toModelMessages({ messages: [user(at)] }).ok).toBe(true);
    expect(toModelMessages({ messages: [user(`${at}a`)] })).toEqual({
      ok: false,
      status: 400,
      error: "Keep questions under 1,000 characters.",
    });
  });

  it("rejects empty and whitespace-only questions", () => {
    expect(toModelMessages({ messages: [user("   ")] }).ok).toBe(false);
    expect(toModelMessages({ messages: [] }).ok).toBe(false);
  });

  it("rejects system messages and unknown roles", () => {
    expect(
      toModelMessages({
        messages: [{ role: "system", parts: [{ type: "text", text: "x" }] }],
      }).ok,
    ).toBe(false);
  });

  it("requires the conversation to end on a question", () => {
    expect(toModelMessages({ messages: [user("Q"), assistant("A")] })).toEqual({
      ok: false,
      status: 400,
      error: "Send a question.",
    });
  });

  it("keeps only the last 20 messages and starts on a user turn", () => {
    const messages = Array.from({ length: 31 }, (_, i) =>
      i % 2 === 0 ? user(`q${i}`) : assistant(`a${i}`),
    );
    const result = toModelMessages({ messages });
    if (!result.ok) throw new Error("expected ok");
    // The last 20 start on an assistant turn (a11), which is dropped.
    expect(result.messages).toHaveLength(19);
    expect(result.messages[0]).toEqual({ role: "user", content: "q12" });
    expect(result.messages.at(-1)).toEqual({ role: "user", content: "q30" });
  });

  it("skips an earlier answer that was stopped before any text", () => {
    const result = toModelMessages({
      messages: [user("Q1"), assistant(""), user("Q2")],
    });
    expect(result).toEqual({
      ok: true,
      messages: [
        { role: "user", content: "Q1" },
        { role: "user", content: "Q2" },
      ],
    });
  });

  it("rejects an oversized earlier answer", () => {
    const long = "a".repeat(LIMITS.assistantChars + 1);
    expect(
      toModelMessages({ messages: [user("Q"), assistant(long), user("Q")] }).ok,
    ).toBe(false);
  });
});

describe("parseChatRequest", () => {
  const post = (body: string) =>
    new Request("http://localhost/api/chat", { method: "POST", body });

  it("parses a valid body", async () => {
    const result = await parseChatRequest(
      post(JSON.stringify({ messages: [user("Hi")] })),
    );
    expect(result.ok).toBe(true);
  });

  it("rejects invalid JSON", async () => {
    expect(await parseChatRequest(post("{"))).toMatchObject({
      ok: false,
      status: 400,
    });
  });

  it("rejects an oversized body with 413", async () => {
    const huge = JSON.stringify({
      messages: [user("x".repeat(LIMITS.bodyBytes))],
    });
    expect(await parseChatRequest(post(huge))).toMatchObject({
      ok: false,
      status: 413,
    });
  });
});
