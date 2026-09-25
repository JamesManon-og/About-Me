import { loadPublishedContent } from "@/lib/knowledge/content";
import { knowledge } from "@/lib/knowledge/james";
import { buildKnowledgeContext } from "./knowledge-context";
import { buildSystemPrompt } from "./system-prompt";

let cached: string | undefined;

/**
 * The full system prompt: rules plus the knowledge base. Built once per server instance,
 * so every request sends the same bytes and hits the prompt cache. Server-only: it reads
 * content/james from disk.
 */
export function systemPrompt(): string {
  cached ??= buildSystemPrompt({
    name: knowledge.profile.name,
    email: knowledge.profile.contact.email,
    knowledge: buildKnowledgeContext(knowledge, loadPublishedContent()),
  });
  return cached;
}
