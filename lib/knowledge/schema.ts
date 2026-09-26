import { z } from "zod";

/**
 * Schemas for everything the site and the agent may say about James.
 *
 * Rules the schemas enforce:
 * - Every published fact carries at least one source id.
 * - Unknowns are `null`, never guessed. `scripts/knowledge-gaps.ts` lists them.
 * - Cross-references (source ids, project slugs) must resolve. `KnowledgeSchema`
 *   checks this, so a typo fails the build instead of shipping.
 */

const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use kebab-case");

/** "2025" or "2025-01". Month precision is the finest the sources give. */
export const PartialDate = z
  .string()
  .regex(/^\d{4}(?:-(?:0[1-9]|1[0-2]))?$/, "Use YYYY or YYYY-MM");

const httpsUrl = z.url({ protocol: /^https$/ });

export const SourceId = slug;
const sourceList = z.array(SourceId).min(1, "Every fact needs a source");

export const SourceSchema = z.object({
  id: SourceId,
  title: z.string().min(1),
  kind: z.enum([
    "resume",
    "repository",
    "writeup",
    "confirmation",
    "session-notes",
    "profile",
  ]),
  /** Only public URLs. Private repos and local files have no URL. */
  url: httpsUrl.nullable(),
  date: PartialDate.nullable(),
});

/** One claim plus where it comes from. */
export const FactSchema = z.object({
  text: z.string().min(1),
  sources: sourceList,
});

export const LinkSchema = z.object({
  id: slug,
  label: z.string().min(1),
  /** https for pages, mailto for the public contact address. */
  url: z.url({ protocol: /^(https|mailto)$/ }),
  kind: z.enum(["profile", "project", "repository", "credential", "contact"]),
  sources: sourceList,
});

export const EducationSchema = z.object({
  degree: z.string().min(1),
  school: z.string().min(1),
  start: PartialDate,
  end: PartialDate.nullable(),
  sources: sourceList,
});

export const ProfileSchema = z.object({
  name: z.string().min(1),
  /** James's own summary, quoted from his resume. */
  headline: FactSchema,
  /** One or two sentences in James's words about the engineer he is. */
  selfDescription: FactSchema.nullable(),
  location: FactSchema,
  timezone: z.string().min(1),
  workMode: FactSchema,
  education: z.array(EducationSchema).min(1),
  contact: z.object({
    email: z.email(),
    sources: sourceList,
  }),
  /** Roles James is looking for, in his priority order. */
  targetRoles: z.array(z.string().min(1)).nullable(),
  /** Framed as learning in progress, never as accomplishments. */
  currentlyLearning: z.array(FactSchema),
  sources: sourceList,
});

export const ExperienceSchema = z.object({
  id: slug,
  organization: z.string().min(1),
  role: z.string().min(1),
  start: PartialDate,
  /** `null` means the role is ongoing. */
  end: PartialDate.nullable(),
  location: z.string().min(1).nullable(),
  workMode: z.enum(["on-site", "remote", "hybrid"]).nullable(),
  highlights: z.array(FactSchema).min(1),
  relatedProjects: z.array(slug),
  sources: sourceList,
});

export const LeadershipSchema = z.object({
  id: slug,
  title: z.string().min(1),
  organization: z.string().min(1),
  start: PartialDate,
  end: PartialDate.nullable(),
  highlights: z.array(FactSchema),
  sources: sourceList,
});

/** The narrative shown on a project page and told by the agent. */
export const ProjectStorySchema = z.object({
  context: FactSchema,
  approach: z.array(FactSchema).min(1),
  decisions: z.array(FactSchema),
  outcome: FactSchema.nullable(),
  /** What James would do differently, in his own words. */
  reflection: FactSchema.nullable(),
});

export const ProjectSchema = z.object({
  slug,
  name: z.string().min(1),
  tagline: z.string().min(1),
  collaboration: z
    .discriminatedUnion("kind", [
      z.object({ kind: z.literal("solo") }),
      z.object({
        kind: z.literal("team"),
        size: z.number().int().min(2).nullable(),
        /** James's own part, only when he has documented it. */
        ownContribution: z.string().min(1).nullable(),
      }),
      z.object({ kind: z.literal("organization"), organization: z.string() }),
    ])
    .nullable(),
  role: z.string().min(1).nullable(),
  start: PartialDate.nullable(),
  end: PartialDate.nullable(),
  status: z.enum(["active", "completed", "unreleased"]).nullable(),
  url: httpsUrl.nullable(),
  repoUrl: httpsUrl.nullable(),
  stack: z.array(z.string().min(1)),
  highlights: z.array(FactSchema).min(1),
  story: ProjectStorySchema,
  /** Things the site must never claim about this project. Guides the agent. */
  caveats: z.array(z.string().min(1)),
  sources: sourceList,
});

export const SkillGroupSchema = z.object({
  id: slug,
  label: z.string().min(1),
  items: z.array(z.string().min(1)).min(1),
  sources: sourceList,
});

export const CertificationSchema = z.object({
  name: z.string().min(1),
  issuer: z.string().min(1),
  date: PartialDate,
  /** The issuer's public verification page, when James has shared one. */
  credentialUrl: httpsUrl.nullable(),
  sources: sourceList,
});

export const PrincipleSchema = z.object({
  id: slug,
  title: z.string().min(1),
  description: z.string().min(1),
  /** "observed": seen in his work. "stated": James said it himself. */
  basis: z.enum(["observed", "stated"]),
  evidence: z.array(FactSchema).min(1),
});

/** A `null` answer is a known unknown: the agent must say it doesn't know. */
/**
 * Other ways a visitor might ask the same question. Used only for matching, never shown.
 * Must not copy an eval case's question (evals/cases.ts), or the eval stops being a test.
 */
const variants = z.array(z.string().min(1)).optional();

/**
 * The prebuilt answer set: the chat answers these without a model (lib/answers/).
 * `known: false` entries are deliberate: the chat replies that it doesn't have that
 * information instead of guessing.
 */
export const FaqSchema = z.discriminatedUnion("known", [
  z.object({
    id: slug,
    known: z.literal(true),
    question: z.string().min(1),
    variants,
    /** Markdown. Written only from the knowledge base and approved by James. */
    answer: z.string().min(1),
    sources: sourceList,
    /** Answers linked to a project, for project cards and follow-up topics. */
    relatedProjects: z.array(slug).optional(),
    /** Questions offered as chips after this answer, by FAQ id. */
    followUps: z.array(slug).optional(),
    /**
     * Specific names (technologies, places, issuers) that point to this answer even when no
     * phrasing matches, such as "Spring Boot" for the skills answer.
     */
    keywords: z.array(z.string().min(1)).optional(),
  }),
  z.object({
    id: slug,
    known: z.literal(false),
    question: z.string().min(1),
    variants,
    answer: z.null(),
  }),
]);

export const ContentStatus = z.enum(["published", "partial", "gap"]);

/** Frontmatter of a `content/james/*.md` file. */
export const ContentMetaSchema = z
  .object({
    title: z.string().min(1),
    status: ContentStatus,
    sources: z.array(SourceId),
    /** What James still needs to supply. Required unless published. */
    missing: z.string().min(1).optional(),
  })
  .superRefine((meta, ctx) => {
    if (meta.status !== "gap" && meta.sources.length === 0) {
      ctx.addIssue({
        code: "custom",
        path: ["sources"],
        message: "Published or partial content needs a source",
      });
    }
    if (meta.status !== "published" && !meta.missing) {
      ctx.addIssue({
        code: "custom",
        path: ["missing"],
        message: "Say what is missing",
      });
    }
  });

export const KnowledgeSchema = z
  .object({
    sources: z.array(SourceSchema).min(1),
    profile: ProfileSchema,
    experience: z.array(ExperienceSchema),
    leadership: z.array(LeadershipSchema),
    projects: z.array(ProjectSchema),
    skills: z.array(SkillGroupSchema),
    certifications: z.array(CertificationSchema),
    principles: z.array(PrincipleSchema),
    faq: z.array(FaqSchema),
    links: z.array(LinkSchema),
  })
  .superRefine((k, ctx) => {
    const sourceIds = new Set(k.sources.map((s) => s.id));
    const slugs = new Set(k.projects.map((p) => p.slug));

    for (const [key, list] of Object.entries({
      sources: k.sources.map((s) => s.id),
      experience: k.experience.map((e) => e.id),
      projects: k.projects.map((p) => p.slug),
      principles: k.principles.map((p) => p.id),
      faq: k.faq.map((f) => f.id),
      links: k.links.map((l) => l.id),
    })) {
      const seen = new Set<string>();
      for (const id of list) {
        if (seen.has(id)) {
          ctx.addIssue({
            code: "custom",
            path: [key],
            message: `Duplicate id "${id}"`,
          });
        }
        seen.add(id);
      }
    }

    for (const { path, id } of collectSourceRefs(k)) {
      if (!sourceIds.has(id)) {
        ctx.addIssue({
          code: "custom",
          path,
          message: `Unknown source "${id}"`,
        });
      }
    }

    const checkProjects = (
      list: string[] | undefined,
      path: PropertyKey[],
    ): void =>
      list?.forEach((s, j) => {
        if (!slugs.has(s)) {
          ctx.addIssue({
            code: "custom",
            path: [...path, j],
            message: `Unknown project "${s}"`,
          });
        }
      });

    k.experience.forEach((e, i) =>
      checkProjects(e.relatedProjects, ["experience", i, "relatedProjects"]),
    );
    const faqIds = new Set(k.faq.map((f) => f.id));
    k.faq.forEach((f, i) => {
      if (!f.known) return;
      checkProjects(f.relatedProjects, ["faq", i, "relatedProjects"]);
      f.followUps?.forEach((id, j) => {
        if (!faqIds.has(id) || id === f.id) {
          ctx.addIssue({
            code: "custom",
            path: ["faq", i, "followUps", j],
            message: `Unknown or self follow-up "${id}"`,
          });
        }
      });
    });
  });

/** Walks any value and yields every id found in a `sources` array. */
export function collectSourceRefs(
  value: unknown,
  path: PropertyKey[] = [],
): { path: PropertyKey[]; id: string }[] {
  if (Array.isArray(value)) {
    return value.flatMap((item, i) => collectSourceRefs(item, [...path, i]));
  }
  if (value === null || typeof value !== "object") return [];

  return Object.entries(value).flatMap(([key, child]) => {
    // The top-level `sources` list holds Source objects, not references.
    if (key === "sources" && path.length > 0 && Array.isArray(child)) {
      return child
        .map((id, i) => ({ path: [...path, key, i], id }))
        .filter(
          (ref): ref is { path: PropertyKey[]; id: string } =>
            typeof ref.id === "string",
        );
    }
    return collectSourceRefs(child, [...path, key]);
  });
}

export type Source = z.infer<typeof SourceSchema>;
export type Fact = z.infer<typeof FactSchema>;
export type Link = z.infer<typeof LinkSchema>;
export type Profile = z.infer<typeof ProfileSchema>;
export type Experience = z.infer<typeof ExperienceSchema>;
export type Leadership = z.infer<typeof LeadershipSchema>;
export type Project = z.infer<typeof ProjectSchema>;
export type ProjectStory = z.infer<typeof ProjectStorySchema>;
export type SkillGroup = z.infer<typeof SkillGroupSchema>;
export type Certification = z.infer<typeof CertificationSchema>;
export type Principle = z.infer<typeof PrincipleSchema>;
export type Faq = z.infer<typeof FaqSchema>;
export type KnownFaq = Extract<Faq, { known: true }>;
export type ContentMeta = z.infer<typeof ContentMetaSchema>;
export type Knowledge = z.infer<typeof KnowledgeSchema>;
