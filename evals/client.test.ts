import { beforeEach, describe, expect, it, vi } from "vitest";
import { MOCK_ANSWER } from "@/lib/agent/model";
import { ask, chatBody, httpHandler, readAnswer } from "./client";

const env = vi.hoisted(() => ({
  ANTHROPIC_API_KEY: undefined as string | undefined,
  CHAT_MODEL_MOCK: "1" as "1" | undefined,
}));
vi.mock("@/lib/env", () => ({ env }));

const { POST } = await import("@/app/api/chat/route");

const sse = (...chunks: unknown[]) =>
  new Response(
    [
      ...chunks.map((chunk) => `data: ${JSON.stringify(chunk)}\n\n`),
      "data: [DONE]\n\n",
    ].join(""),
    { headers: { "content-type": "text/event-stream" } },
  );

beforeEach(() => {
  env.CHAT_MODEL_MOCK = "1";
});

describe("chatBody", () => {
  it("builds a useChat body: history, then the question", () => {
    expect(
      chatBody({
        question: "And JobPilot?",
        history: [
          { role: "user", text: "What is MoneyApp?" },
          { role: "assistant", text: "A shared-expense app." },
        ],
      }),
    ).toEqual({
      messages: [
        {
          id: "m1",
          role: "user",
          parts: [{ type: "text", text: "What is MoneyApp?" }],
        },
        {
          id: "m2",
          role: "assistant",
          parts: [{ type: "text", text: "A shared-expense app." }],
        },
        {
          id: "m3",
          role: "user",
          parts: [{ type: "text", text: "And JobPilot?" }],
        },
      ],
    });
  });
});

describe("readAnswer", () => {
  it("joins text deltas and keeps the finish reason", async () => {
    const answer = await readAnswer(
      sse(
        { type: "start" },
        { type: "text-start", id: "t" },
        { type: "text-delta", id: "t", delta: "Davao " },
        { type: "text-delta", id: "t", delta: "City." },
        { type: "text-end", id: "t" },
        { type: "finish", finishReason: "length" },
      ),
    );
    expect(answer).toEqual({ text: "Davao City.", finishReason: "length" });
  });

  it("throws on a stream error, an abort or an HTTP error", async () => {
    await expect(
      readAnswer(sse({ type: "error", errorText: "Overloaded" })),
    ).rejects.toThrow("Overloaded");
    await expect(readAnswer(sse({ type: "abort" }))).rejects.toThrow("aborted");
    await expect(
      readAnswer(Response.json({ error: "busy" }, { status: 503 })),
    ).rejects.toThrow("HTTP 503");
  });
});

describe("ask", () => {
  it("gets a prebuilt answer from the route in-process, and says so", async () => {
    const answer = await ask(POST, { question: "Where is James based?" });
    expect(answer.served).toEqual({
      source: "answer",
      answerId: "where-based",
    });
    expect(answer.text).toMatch(/Davao City/);
  });

  it("gets the model's answer for a question nothing matches", async () => {
    const answer = await ask(POST, {
      question: "What is the airspeed of an unladen swallow?",
    });
    expect(answer).toEqual({
      text: MOCK_ANSWER,
      finishReason: "stop",
      served: { source: "model" },
    });
  });

  it("gets the fallback when no model is configured", async () => {
    env.CHAT_MODEL_MOCK = undefined;
    const answer = await ask(POST, {
      question: "What is the airspeed of an unladen swallow?",
    });
    expect(answer.served).toEqual({ source: "fallback" });
  });

  it("posts the same body to a server URL", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(sse({ type: "text-delta", id: "t", delta: "Hi." }));
    const answer = await ask(httpHandler("http://example.test/api/chat"), {
      question: "Hello?",
    });
    expect(answer.text).toBe("Hi.");
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe("http://example.test/api/chat");
    expect(JSON.parse(String(init?.body))).toEqual(
      chatBody({ question: "Hello?" }),
    );
    fetchMock.mockRestore();
  });
});
