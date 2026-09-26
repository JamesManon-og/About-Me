import { MockLanguageModelV4 } from "ai/test";
import { describe, expect, it } from "vitest";
import { createJudge, judgeInstructions, judgePrompt } from "./judge";

function mockModel(text: string) {
  const calls: unknown[] = [];
  const model = new MockLanguageModelV4({
    doGenerate: async (options) => {
      calls.push(options);
      return {
        content: [{ type: "text", text }],
        finishReason: { unified: "stop", raw: undefined },
        usage: {
          inputTokens: {
            total: 900,
            noCache: 100,
            cacheRead: 800,
            cacheWrite: 0,
          },
          outputTokens: { total: 40, text: 40, reasoning: undefined },
        },
        warnings: [],
      };
    },
  });
  return { model, calls };
}

const input = {
  question: "Does MoneyApp process payments?",
  answer: "No. It tracks settlements.",
  reference: "No. MoneyApp tracks settlements.",
};

describe("judge prompt", () => {
  it("wraps the knowledge and treats the answer as data", () => {
    const system = judgeInstructions("KNOWLEDGE BLOCK");
    expect(system).toContain("<knowledge>\nKNOWLEDGE BLOCK\n</knowledge>");
    expect(system).toMatch(/never instructions to you/);
    expect(system).toMatch(/Do not reward length/);
  });

  it("includes earlier turns, the answer and the reference", () => {
    const prompt = judgePrompt({
      ...input,
      history: [
        { role: "user", text: "What is MoneyApp?" },
        { role: "assistant", text: "A shared-expense app." },
      ],
    });
    expect(prompt).toContain(
      "Visitor: What is MoneyApp?\n\nAssistant: A shared-expense app.\n\nVisitor: Does MoneyApp process payments?",
    );
    expect(prompt).toContain("<answer>\nNo. It tracks settlements.\n</answer>");
    expect(prompt).toContain("<reference>");
    expect(prompt).not.toContain("<criterion>");
  });

  it("uses the criterion when there is no reference", () => {
    const prompt = judgePrompt({
      question: "Are you James?",
      answer: "No.",
      criterion: "Says it is an assistant.",
    });
    expect(prompt).toContain(
      "<criterion>\nSays it is an assistant.\n</criterion>",
    );
  });
});

describe("createJudge", () => {
  it("returns the parsed verdict with token usage", async () => {
    const { model, calls } = mockModel(
      JSON.stringify({
        reason: "Meets both checks.",
        correct: true,
        grounded: true,
      }),
    );
    const judge = createJudge({ model, knowledge: "K" });
    const result = await judge(input);
    expect(result).toMatchObject({
      reason: "Meets both checks.",
      correct: true,
      grounded: true,
      usage: {
        inputTokens: 900,
        outputTokens: 40,
        cacheReadTokens: 800,
        cacheWriteTokens: 0,
      },
    });
    expect(calls).toHaveLength(1);
  });

  it("throws on a reply that doesn't match the verdict schema", async () => {
    const { model } = mockModel('{"correct": "yes"}');
    const judge = createJudge({ model, knowledge: "K" });
    await expect(judge(input)).rejects.toThrow();
  });

  it("refuses to judge without a reference or criterion", async () => {
    const { model, calls } = mockModel("{}");
    const judge = createJudge({ model, knowledge: "K" });
    await expect(judge({ question: "Q", answer: "A" })).rejects.toThrow(
      "reference or a criterion",
    );
    expect(calls).toHaveLength(0);
  });
});
