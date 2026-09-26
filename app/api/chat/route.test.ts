import { beforeEach, describe, expect, it, vi } from "vitest";
import { MOCK_ANSWER } from "@/lib/agent/model";
import { unknownReply } from "@/lib/agent/system-prompt";
import { knowledge } from "@/lib/knowledge/james";

const env = vi.hoisted(() => ({
  ANTHROPIC_API_KEY: undefined as string | undefined,
  CHAT_MODEL_MOCK: undefined as "1" | undefined,
}));
vi.mock("@/lib/env", () => ({ env }));

const { POST } = await import("./route");

/** A question no prebuilt answer covers. */
const UNMATCHED = "What is the airspeed of an unladen swallow?";

const question = (text: string) =>
  new Request("http://localhost/api/chat", {
    method: "POST",
    body: JSON.stringify({
      messages: [{ id: "1", role: "user", parts: [{ type: "text", text }] }],
    }),
  });

type Chunk = {
  type: string;
  delta?: string;
  data?: { kind: string; questions: string[] };
  messageMetadata?: Record<string, string>;
};

async function read(response: Response) {
  const chunks = (await response.text())
    .split("\n")
    .filter((line) => line.startsWith("data: ") && line !== "data: [DONE]")
    .map((line) => JSON.parse(line.slice("data: ".length)) as Chunk);
  return {
    text: chunks.map((c) => (c.type === "text-delta" ? c.delta : "")).join(""),
    metadata: chunks.find((c) => c.type === "start")?.messageMetadata,
    suggestions: chunks.find((c) => c.type === "data-suggestions")?.data,
  };
}

beforeEach(() => {
  env.ANTHROPIC_API_KEY = undefined;
  env.CHAT_MODEL_MOCK = undefined;
});

describe("POST /api/chat", () => {
  it("rejects an invalid body before answering", async () => {
    const response = await POST(question(""));
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "Send a question." });
  });

  it("answers a matched question from the prebuilt set, with no model", async () => {
    const response = await POST(question("Does MoneyApp process payments?"));
    expect(response.status).toBe(200);
    expect(response.headers.get("x-vercel-ai-ui-message-stream")).toBe("v1");
    const { text, metadata, suggestions } = await read(response);
    expect(text).toBe(
      knowledge.faq.find((f) => f.id === "moneyapp-payments")?.answer,
    );
    expect(metadata).toEqual({
      source: "answer",
      answerId: "moneyapp-payments",
    });
    expect(suggestions?.kind).toBe("related");
    expect(suggestions?.questions.length).toBeGreaterThan(0);
  });

  it("falls back to the fixed reply and the closest questions with no model", async () => {
    const { text, metadata, suggestions } = await read(
      await POST(question(UNMATCHED)),
    );
    expect(text).toBe(unknownReply(knowledge.profile.contact.email));
    expect(metadata).toEqual({ source: "fallback" });
    expect(suggestions?.kind).toBe("closest");
    expect(suggestions?.questions).toHaveLength(3);
  });

  it("sends only unmatched questions to the model when one is configured", async () => {
    env.CHAT_MODEL_MOCK = "1";
    const unmatched = await read(await POST(question(UNMATCHED)));
    expect(unmatched.text).toBe(MOCK_ANSWER);
    expect(unmatched.metadata).toEqual({ source: "model" });

    const matched = await read(
      await POST(question("Does MoneyApp process payments?")),
    );
    expect(matched.metadata).toEqual({
      source: "answer",
      answerId: "moneyapp-payments",
    });
  });
});
