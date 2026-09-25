/**
 * Finds server secrets in text that is about to be shipped to browsers.
 * Used by scripts/scan-static.ts on `.next/static` after every build.
 */

/** Anthropic API keys start with this prefix. */
const ANTHROPIC_KEY = /sk-ant-[A-Za-z0-9_-]{10,}/g;

/** Names that only server code reads. Seeing one in a client chunk means server code leaked. */
const SERVER_ONLY_NAMES = ["ANTHROPIC_API_KEY", "CHAT_MODEL_MOCK"];

export function findSecrets(
  text: string,
  knownSecrets: string[] = [],
): string[] {
  const found = new Set<string>();
  for (const match of text.matchAll(ANTHROPIC_KEY)) {
    found.add(`${match[0].slice(0, 10)}… (API key pattern)`);
  }
  for (const name of SERVER_ONLY_NAMES) {
    if (text.includes(name)) found.add(`${name} (server-only name)`);
  }
  for (const secret of knownSecrets) {
    if (secret && text.includes(secret)) found.add("the configured API key");
  }
  return [...found];
}
