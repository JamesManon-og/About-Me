import { streamText } from "ai";
import { describe, expect, it } from "vitest";
import {
  chatModel,
  DEFAULT_CHAT_MODEL,
  MOCK_ANSWER,
  MOCK_SLOW_MARKER,
} from "./model";

function modelId(model: unknown): string | undefined {
  return (model as { modelId?: string }).modelId;
}

describe("chatModel", () => {
  it("returns null without a key or the mock", () => {
    expect(chatModel({})).toBeNull();
  });

  it("uses the default model with a key", () => {
    const chat = chatModel({ ANTHROPIC_API_KEY: "test-key" });
    expect(modelId(chat?.model)).toBe(DEFAULT_CHAT_MODEL);
    expect(chat?.providerOptions).toBeUndefined();
  });

  it("honours CHAT_MODEL and lowers effort on newer models", () => {
    const chat = chatModel({
      ANTHROPIC_API_KEY: "test-key",
      CHAT_MODEL: "claude-sonnet-5",
    });
    expect(modelId(chat?.model)).toBe("claude-sonnet-5");
    expect(chat?.providerOptions).toEqual({ anthropic: { effort: "low" } });
  });

  it("prefers the mock when it is on, even with a key", async () => {
    const chat = chatModel({ ANTHROPIC_API_KEY: "k", CHAT_MODEL_MOCK: "1" });
    if (!chat) throw new Error("expected a model");
    const result = streamText({ model: chat.model, prompt: "Hello" });
    expect(await result.text).toBe(MOCK_ANSWER);
  });

  it("streams word by word for the slow marker", async () => {
    const chat = chatModel({ CHAT_MODEL_MOCK: "1" });
    if (!chat) throw new Error("expected a model");
    const result = streamText({
      model: chat.model,
      prompt: `Question ${MOCK_SLOW_MARKER}`,
    });
    const reader = result.textStream.getReader();
    const first = await reader.read();
    expect(first.value).toBe("word1 ");
    await reader.cancel();
  });
});
