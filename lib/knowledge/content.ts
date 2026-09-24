import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { ContentMetaSchema, type ContentMeta } from "./schema";

/**
 * Prose knowledge in `content/james/*.md`. Server-only: it reads the files
 * from disk.
 *
 * Each file starts with a small frontmatter block of `key: value` lines:
 *
 *   ---
 *   title: How James works with AI
 *   status: published
 *   sources: dev-session-notes, resume-2026-09
 *   ---
 */

export const CONTENT_DIR = path.join(process.cwd(), "content", "james");

export type ContentDoc = {
  slug: string;
  meta: ContentMeta;
  body: string;
};

const FRONTMATTER = /^---\n([\s\S]*?)\n---\n?/;

export function parseContentDoc(slug: string, raw: string): ContentDoc {
  const text = raw.replace(/\r\n/g, "\n");
  const match = FRONTMATTER.exec(text);
  if (!match) {
    throw new Error(`content/james/${slug}.md: missing frontmatter`);
  }

  const fields: Record<string, string> = {};
  for (const line of (match[1] ?? "").split("\n")) {
    if (!line.trim()) continue;
    const colon = line.indexOf(":");
    if (colon === -1) {
      throw new Error(`content/james/${slug}.md: bad frontmatter "${line}"`);
    }
    fields[line.slice(0, colon).trim()] = line.slice(colon + 1).trim();
  }

  const result = ContentMetaSchema.safeParse({
    ...fields,
    sources: (fields.sources ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  });
  if (!result.success) {
    throw new Error(
      `content/james/${slug}.md: invalid frontmatter\n${result.error.message}`,
    );
  }

  return { slug, meta: result.data, body: text.slice(match[0].length).trim() };
}

/** Every content file, including gaps. Sorted by slug. */
export function loadAllContent(dir: string = CONTENT_DIR): ContentDoc[] {
  return readdirSync(dir)
    .filter((file) => file.endsWith(".md"))
    .sort()
    .map((file) =>
      parseContentDoc(
        file.slice(0, -".md".length),
        readFileSync(path.join(dir, file), "utf8"),
      ),
    );
}

/** Only what the site and the agent may use: published or partial files. */
export function loadPublishedContent(dir: string = CONTENT_DIR): ContentDoc[] {
  return loadAllContent(dir).filter((doc) => doc.meta.status !== "gap");
}
