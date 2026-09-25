/**
 * Fails when a server secret appears in the files Next.js serves to browsers.
 * Runs after `next build` as part of `bun run check`. Bun loads .env.local, so the
 * configured key itself is also searched for when it is set.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { findSecrets } from "@/lib/security/secret-scan";

const STATIC_DIR = path.join(process.cwd(), ".next", "static");
const TEXT_FILE = /\.(?:js|mjs|css|html|json|txt|map)$/;

function* files(dir: string): Generator<string> {
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) yield* files(full);
    else if (TEXT_FILE.test(entry)) yield full;
  }
}

const known = [process.env.ANTHROPIC_API_KEY ?? ""].filter(Boolean);
let scanned = 0;
const problems: string[] = [];

for (const file of files(STATIC_DIR)) {
  scanned += 1;
  for (const hit of findSecrets(readFileSync(file, "utf8"), known)) {
    problems.push(`${path.relative(process.cwd(), file)}: ${hit}`);
  }
}

if (scanned === 0) {
  console.error(
    "scan:static: no files in .next/static. Run `bun run build` first.",
  );
  process.exit(1);
}
if (problems.length > 0) {
  console.error(
    `scan:static: secrets found in client files:\n  ${problems.join("\n  ")}`,
  );
  process.exit(1);
}
console.log(`scan:static: ${scanned} client files, no secrets.`);
