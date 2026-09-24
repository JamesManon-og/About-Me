import { describe, expect, it } from "vitest";
import { parseEnv } from "./env";

describe("parseEnv", () => {
  it("accepts an empty environment, since nothing is required yet", () => {
    expect(parseEnv({})).toEqual({ NODE_ENV: "development" });
  });

  it("accepts valid values", () => {
    const env = parseEnv({
      NODE_ENV: "production",
      NEXT_PUBLIC_SITE_URL: "https://example.com",
    });
    expect(env.NODE_ENV).toBe("production");
    expect(env.NEXT_PUBLIC_SITE_URL).toBe("https://example.com");
  });

  it("treats empty strings as unset", () => {
    expect(
      parseEnv({ NEXT_PUBLIC_SITE_URL: "" }).NEXT_PUBLIC_SITE_URL,
    ).toBeUndefined();
  });

  it("drops variables that are not in the schema", () => {
    expect(parseEnv({ UNRELATED_SECRET: "x" })).not.toHaveProperty(
      "UNRELATED_SECRET",
    );
  });

  it("throws a readable error naming the invalid variable", () => {
    expect(() => parseEnv({ NEXT_PUBLIC_SITE_URL: "not a url" })).toThrow(
      /Invalid environment variables:[\s\S]*NEXT_PUBLIC_SITE_URL/,
    );
  });

  it("rejects an unknown NODE_ENV", () => {
    expect(() => parseEnv({ NODE_ENV: "staging" })).toThrow(/NODE_ENV/);
  });
});
