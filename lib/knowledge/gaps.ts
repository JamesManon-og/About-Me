import type { ContentDoc } from "./content";
import type { Knowledge } from "./schema";

export type Gap = { where: string; detail: string };

/** Every `null` in the structured data, as a readable path. */
export function findNullFields(value: unknown, path = ""): string[] {
  if (value === null) return [path];
  if (Array.isArray(value)) {
    return value.flatMap((item, i) =>
      findNullFields(item, `${path}[${labelFor(item, i)}]`),
    );
  }
  if (typeof value !== "object") return [];
  return Object.entries(value).flatMap(([key, child]) =>
    findNullFields(child, path ? `${path}.${key}` : key),
  );
}

/** Use an item's id or slug in the path when it has one. */
function labelFor(item: unknown, index: number): string {
  if (item && typeof item === "object") {
    const record = item as Record<string, unknown>;
    for (const key of ["id", "slug"]) {
      if (typeof record[key] === "string") return record[key];
    }
  }
  return String(index);
}

/**
 * What James still needs to supply. Some nulls are expected and skipped:
 * a private repository has no link, and an active project has no end date.
 */
export function findGaps(knowledge: Knowledge, content: ContentDoc[]): Gap[] {
  const ongoing = new Set(
    knowledge.projects
      .filter((p) => p.status === "active")
      .map((p) => `projects[${p.slug}].end`),
  );

  // Sources are metadata, and FAQ unknowns are reported by question below.
  const data = { ...knowledge, sources: undefined, faq: undefined };
  const dataGaps = findNullFields(data)
    .filter((where) => !/\.(url|repoUrl)$/.test(where))
    .filter((where) => !ongoing.has(where))
    .map((where) => ({ where, detail: "Unknown (null)" }));

  const faqGaps = knowledge.faq
    .filter((entry) => !entry.known)
    .map((entry) => ({ where: `faq[${entry.id}]`, detail: entry.question }));

  const contentGaps = content
    .filter((doc) => doc.meta.status !== "published")
    .map((doc) => ({
      where: `content/james/${doc.slug}.md (${doc.meta.status})`,
      detail: doc.meta.missing ?? "",
    }));

  return [...dataGaps, ...faqGaps, ...contentGaps];
}
