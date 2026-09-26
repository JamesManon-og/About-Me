import { describe, expect, it } from "vitest";
import { unknownReply } from "@/lib/agent/system-prompt";
import { knowledge } from "@/lib/knowledge/james";
import { respond } from "./respond";

const UNKNOWN = unknownReply(knowledge.profile.contact.email);
const question = (text: string) => ({ role: "user", content: text });
const answer = (text: string) => ({ role: "assistant", content: text });
const faq = (id: string) => knowledge.faq.find((entry) => entry.id === id)!;

describe("respond", () => {
  it("answers with the approved text and its follow-ups", () => {
    const reply = respond([question("Does MoneyApp process payments?")]);
    const entry = faq("moneyapp-payments");
    expect(reply).toMatchObject({
      source: "answer",
      answerId: "moneyapp-payments",
      text: entry.answer,
      suggestionKind: "related",
    });
    const followUps = (entry.known ? entry.followUps! : []).map(
      (id) => faq(id).question,
    );
    // Its own follow-ups first, padded with general questions up to three.
    expect(reply.suggestions.slice(0, followUps.length)).toEqual(followUps);
    expect(reply.suggestions).toHaveLength(3);
  });

  it("gives the fixed unknown reply for a known gap, with the closest questions", () => {
    const reply = respond([question("What are James's hobbies?")]);
    expect(reply).toMatchObject({
      source: "answer",
      answerId: "hobbies",
      text: UNKNOWN,
      suggestionKind: "closest",
    });
    expect(reply.suggestions).toHaveLength(3);
  });

  it("falls back with three suggestions when nothing matches", () => {
    const reply = respond([question("What is the capital of France?")]);
    expect(reply).toEqual({
      source: "fallback",
      text: UNKNOWN,
      suggestionKind: "closest",
      suggestions: [
        "What can James do?",
        "What projects has James built?",
        "How can I contact James?",
      ],
    });
  });

  it("offers the closest questions when a question is near one", () => {
    const reply = respond([question("What is MoneyApp's pricing model?")]);
    expect(reply.source).toBe("fallback");
    expect(reply.suggestions[0]).toMatch(/MoneyApp/);
  });

  it("carries the project into a follow-up", () => {
    const reply = respond([
      question("What is MoneyApp?"),
      answer(faq("moneyapp").answer ?? ""),
      question("did he build it alone?"),
    ]);
    expect(reply).toMatchObject({
      source: "answer",
      answerId: "moneyapp-solo",
    });
  });

  it("doesn't suggest questions already answered in the conversation", () => {
    const reply = respond([
      question("What is MoneyApp?"),
      answer("..."),
      question("Does MoneyApp process payments?"),
    ]);
    expect(reply.suggestions).not.toContain(faq("moneyapp").question);
  });

  it("never suggests a known gap", () => {
    const gaps = new Set(
      knowledge.faq.filter((f) => !f.known).map((f) => f.question),
    );
    for (const entry of knowledge.faq) {
      const reply = respond([question(entry.question)]);
      for (const suggestion of reply.suggestions) {
        expect(gaps.has(suggestion), `${entry.id} → ${suggestion}`).toBe(false);
      }
    }
  });
});
