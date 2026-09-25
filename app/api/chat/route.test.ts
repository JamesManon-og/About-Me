import { beforeEach, describe, expect, it, vi } from "vitest";
import { MOCK_ANSWER } from "@/lib/agent/model";

const env = vi.hoisted(() => ({
  ANTHROPIC_API_KEY: undefined as string | undefined,
  CHAT_MODEL_MOCK: undefined as "1" | undefined,
}));
vi.mock("@/lib/env", () => ({ env }));

const { POST } = await import("./route");

const question = (text: string) =>
  new Request("http://localhost/api/chat", {
    method: "POST",
    body: JSON.stringify({
      messages: [{ id: "1", role: "user", parts: [{ type: "text", text }] }],
    }),
  });

beforeEach(() => {
  env.ANTHROPIC_API_KEY = undefined;
  env.CHAT_MODEL_MOCK = undefined;
});

describe("POST /api/chat", () => {
  it("rejects an invalid body before touching the model", async () => {
    const response = await POST(question(""));
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "Send a question." });
  });

  it("answers 503 when no key is set and the mock is off", async () => {
    const response = await POST(question("Hi"));
    expect(response.status).toBe(503);
  });

  it("streams a UI message stream from the model", async () => {
    env.CHAT_MODEL_MOCK = "1";
    const response = await POST(question("Hi"));
    expect(response.status).toBe(200);
    expect(response.headers.get("x-vercel-ai-ui-message-stream")).toBe("v1");

    const body = await response.text();
    const deltas = [...body.matchAll(/"delta":"((?:[^"\\]|\\.)*)"/g)]
      .map((match) => JSON.parse(`"${match[1]}"`) as string)
      .join("");
    expect(deltas).toBe(MOCK_ANSWER);
  });
});
