import { knowledge } from "./james";
import {
  collectSourceRefs,
  type Knowledge,
  type KnownFaq,
  type Link,
  type Project,
  type Source,
} from "./schema";

/**
 * Read-only lookups over the validated knowledge. The chat's answer cards and agent
 * tools (Stage 6) build on them, so every answer shows the same facts.
 */

export function getProject(
  slug: string,
  k: Knowledge = knowledge,
): Project | undefined {
  return k.projects.find((p) => p.slug === slug);
}

/** The projects before and after this one, in the order the site lists them. */
export function projectNeighbours(
  slug: string,
  k: Knowledge = knowledge,
): { previous: Project | null; next: Project | null } {
  const i = k.projects.findIndex((p) => p.slug === slug);
  if (i === -1) return { previous: null, next: null };
  return {
    previous: k.projects[i - 1] ?? null,
    next: k.projects[i + 1] ?? null,
  };
}

/** Answered questions linked to a project. Unknowns are never included. */
export function faqForProject(
  slug: string,
  k: Knowledge = knowledge,
): KnownFaq[] {
  return k.faq.filter(
    (f): f is KnownFaq => f.known && !!f.relatedProjects?.includes(slug),
  );
}

/**
 * Every source cited anywhere inside `value`, once each, in the order of the source
 * list. Use it for a "Sources" footnote under a block of facts.
 */
export function sourcesCitedIn(
  value: unknown,
  k: Knowledge = knowledge,
): Source[] {
  // Wrapped, because collectSourceRefs treats a root-level `sources` key as the
  // knowledge base's own Source list rather than as references.
  const ids = new Set(collectSourceRefs([value]).map((ref) => ref.id));
  return k.sources.filter((s) => ids.has(s.id));
}

export function linksOfKind(
  kind: Link["kind"],
  k: Knowledge = knowledge,
): Link[] {
  return k.links.filter((l) => l.kind === kind);
}
