import { describe, expect, it } from "vitest";
import { parseContentDoc } from "./content";

describe("parseContentDoc", () => {
  it("parses frontmatter and trims the body", () => {
    const doc = parseContentDoc(
      "about",
      "---\ntitle: About\nstatus: published\nsources: a, b\n---\n\nHello.\n",
    );
    expect(doc).toEqual({
      slug: "about",
      meta: { title: "About", status: "published", sources: ["a", "b"] },
      body: "Hello.",
    });
  });

  it("keeps colons inside values", () => {
    const doc = parseContentDoc(
      "x",
      "---\ntitle: Goals: now\nstatus: gap\nsources:\nmissing: Roles: in order\n---\n",
    );
    expect(doc.meta.title).toBe("Goals: now");
    expect(doc.meta.sources).toEqual([]);
    expect(doc.meta.missing).toBe("Roles: in order");
  });

  it("handles Windows line endings", () => {
    const doc = parseContentDoc(
      "x",
      "---\r\ntitle: T\r\nstatus: published\r\nsources: a\r\n---\r\nBody",
    );
    expect(doc.body).toBe("Body");
  });

  it("throws without frontmatter", () => {
    expect(() => parseContentDoc("x", "Just prose")).toThrow(
      /missing frontmatter/,
    );
  });

  it("throws on an invalid status, naming the file", () => {
    expect(() =>
      parseContentDoc("x", "---\ntitle: T\nstatus: draft\nsources: a\n---\n"),
    ).toThrow(/content\/james\/x\.md: invalid frontmatter/);
  });
});
