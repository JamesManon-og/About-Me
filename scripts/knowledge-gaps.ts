/**
 * Lists everything about James that is still unknown, so he knows what to
 * fill in. Run with `bun run knowledge:gaps`.
 */
import { loadAllContent } from "@/lib/knowledge/content";
import { findGaps } from "@/lib/knowledge/gaps";
import { knowledge } from "@/lib/knowledge/james";

const gaps = findGaps(knowledge, loadAllContent());

const groups = {
  "Structured data (null fields)": gaps.filter(
    (g) => !g.where.startsWith("faq[") && !g.where.startsWith("content/"),
  ),
  'Questions the agent must answer with "I don\'t have that information"':
    gaps.filter((g) => g.where.startsWith("faq[")),
  "Prose topics": gaps.filter((g) => g.where.startsWith("content/")),
};

console.log(`Knowledge gaps: ${gaps.length}\n`);
for (const [title, items] of Object.entries(groups)) {
  console.log(`${title} (${items.length})`);
  for (const { where, detail } of items) {
    console.log(
      detail === "Unknown (null)" ? `  - ${where}` : `  - ${where}: ${detail}`,
    );
  }
  console.log();
}
