import { describe, expect, it } from "vitest";
import { findSecrets } from "./secret-scan";

describe("findSecrets", () => {
  it("passes ordinary bundle code", () => {
    expect(findSecrets('function a(){return "sk-"+b}')).toEqual([]);
  });

  it("flags anything shaped like an Anthropic key, without printing it", () => {
    const [hit] = findSecrets('const k="sk-ant-api03-abcdefghijklmnop";');
    expect(hit).toBe("sk-ant-api… (API key pattern)");
  });

  it("flags server-only variable names", () => {
    expect(findSecrets("process.env.ANTHROPIC_API_KEY")).toEqual([
      "ANTHROPIC_API_KEY (server-only name)",
    ]);
  });

  it("flags the configured key even if its format changes", () => {
    expect(findSecrets("x=abc123secret", ["abc123secret"])).toEqual([
      "the configured API key",
    ]);
  });
});
