import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  candidateTerms,
  findDenylistedTerms,
  findEmails,
  findPhoneNumbers,
  sha256,
} from "./forbidden";
import { knowledge } from "./james";

const ROOT = process.cwd();

/** Public text the site, the agent or the repo can show. */
const SCAN_DIRS = [
  "app",
  "components",
  "content",
  "data",
  "lib",
  "docs",
  "evals",
  "scripts",
];
const SCAN_ROOT_FILES = ["README.md", "CLAUDE.md", "AGENTS.md"];
const TEXT_EXTENSIONS = new Set([
  ".ts",
  ".tsx",
  ".md",
  ".mdx",
  ".json",
  ".css",
]);
const SKIP = [/^docs\/private\//, /^evals\/results\//, /\.test\.tsx?$/];

function walk(dir: string): string[] {
  let entries: string[];
  try {
    entries = readdirSync(path.join(ROOT, dir));
  } catch {
    return [];
  }
  return entries.flatMap((name) => {
    const rel = `${dir}/${name}`;
    if (SKIP.some((re) => re.test(rel))) return [];
    if (statSync(path.join(ROOT, rel)).isDirectory()) return walk(rel);
    return TEXT_EXTENSIONS.has(path.extname(name)) ? [rel] : [];
  });
}

const files = [...SCAN_DIRS.flatMap(walk), ...SCAN_ROOT_FILES].map((rel) => ({
  rel,
  text: readFileSync(path.join(ROOT, rel), "utf8"),
}));

describe("forbidden-content helpers", () => {
  it("builds single words and adjacent pairs", () => {
    expect(candidateTerms("Hello, big World")).toEqual(
      new Set(["hello", "big", "world", "hello big", "big world"]),
    );
  });

  it("matches a denylisted term regardless of case and punctuation", () => {
    const denylist = new Set([sha256("secret project")]);
    expect(findDenylistedTerms("the Secret-Project repo", denylist)).toEqual([
      sha256("secret project"),
    ]);
    expect(findDenylistedTerms("a secret plan", denylist)).toEqual([]);
  });

  it.each([
    "+63 912-345-6789",
    "09123456789",
    "(082) 123 4567 890",
    "+1 (415) 555-0100",
  ])("detects the phone number %s", (phone) => {
    expect(findPhoneNumbers(`call ${phone} now`)).toHaveLength(1);
  });

  it.each([
    "2022-08 to 2026-05",
    "645,000+ educators",
    "93 to 315 tests",
    "a6c085a1b85dd7e11a12b57341e821e7e57ffa3f54273442dc931a825df49980",
    '<path d="M3 8.5C42 4.2 92 3.4 132 5.4 160 6.8 184 8 197 5" />',
    '<svg viewBox="0 0 200 80 120 40">',
  ])("ignores %s", (text) => {
    expect(findPhoneNumbers(text)).toEqual([]);
  });
});

describe("published files", () => {
  it("scans a meaningful set of files", () => {
    expect(files.length).toBeGreaterThan(20);
    expect(files.some((f) => f.rel.startsWith("content/james/"))).toBe(true);
    expect(files.some((f) => f.rel.startsWith("data/james/"))).toBe(true);
  });

  it("contain no denylisted private names", () => {
    const hits = files.flatMap((f) =>
      findDenylistedTerms(f.text).map((hash) => `${f.rel}: ${hash}`),
    );
    expect(hits).toEqual([]);
  });

  it("contain no phone numbers", () => {
    const hits = files.flatMap((f) =>
      findPhoneNumbers(f.text).map((match) => `${f.rel}: ${match}`),
    );
    expect(hits).toEqual([]);
  });

  it("contain no email address except the public contact", () => {
    const allowed = knowledge.profile.contact.email;
    const hits = files.flatMap((f) =>
      findEmails(f.text)
        .filter((email) => email !== allowed)
        .map((email) => `${f.rel}: ${email}`),
    );
    expect(hits).toEqual([]);
  });
});
