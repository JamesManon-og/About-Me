import { describe, expect, it } from "vitest";
import { buildSystemPrompt, unknownReply } from "./system-prompt";

const prompt = buildSystemPrompt({
  name: "James Manon-og",
  email: "someone@example.com",
  knowledge: "KNOWLEDGE BLOCK",
});

describe("buildSystemPrompt", () => {
  it("wraps the knowledge in its own tag, after the rules", () => {
    expect(prompt).toContain("<knowledge>\nKNOWLEDGE BLOCK\n</knowledge>");
    expect(prompt.indexOf("<rules>")).toBeLessThan(
      prompt.indexOf("<knowledge>"),
    );
  });

  it("gives the exact unknown reply with the contact email", () => {
    expect(unknownReply("someone@example.com")).toBe(
      "I don't have that information. You can ask James directly at someone@example.com.",
    );
    expect(prompt).toContain(unknownReply("someone@example.com"));
  });

  it("keeps the identity rule: third person, never James", () => {
    expect(prompt).toMatch(/third person/);
    expect(prompt).toMatch(/never say "I am James"/);
  });

  it("allows no contact detail except the email", () => {
    expect(prompt).toMatch(
      /only contact detail you may share is the email someone@example\.com/,
    );
  });
});
