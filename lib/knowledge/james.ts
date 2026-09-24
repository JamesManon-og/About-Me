import { certifications, skills } from "@/data/james/skills";
import { experience, leadership } from "@/data/james/experience";
import { faq } from "@/data/james/faq";
import { links } from "@/data/james/links";
import { principles } from "@/data/james/principles";
import { profile } from "@/data/james/profile";
import { projects } from "@/data/james/projects";
import { sources } from "@/data/james/sources";
import { KnowledgeSchema, type Knowledge } from "./schema";

/**
 * All structured knowledge about James, validated once at module load.
 * A bad fact or a dangling reference throws here, so the build fails.
 */
export const knowledge: Knowledge = KnowledgeSchema.parse({
  sources,
  profile,
  experience,
  leadership,
  projects,
  skills,
  certifications,
  principles,
  faq,
  links,
});
