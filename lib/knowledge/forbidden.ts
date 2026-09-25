import { createHash } from "node:crypto";

/**
 * Checks for content that must never be published about James.
 *
 * Private project, venture and people names can't be listed in plain text,
 * because this repository is public. They are stored as SHA-256 hashes of the
 * lowercased term instead. The plain-text list lives in the private facts
 * ledger. To add one, hash the lowercased term:
 *
 *   printf '%s' 'term' | shasum -a 256
 *
 * Terms are one word or two words separated by a single space.
 */
export const DENYLIST_HASHES: ReadonlySet<string> = new Set([
  "845391eeb5681097f2682e4bb810c00cb81f25d5d4140877791de148bcc2a242",
  "7eb3b27f898b3fecda9838c04f7f7e07a46b66e383d1e15640572a3bb51d6400",
  "f3de31036a8ee04087daea6a2a36471091bec96b99d2d419e4cdf42ba6913380",
  "75169ec88607eb35a6e98551ab2643842ee9e623d960e4c88791be428f8ed2e5",
  "e03a29c22443d1073b39a4f47e751c7db890ba3906b6e92dad6e43007fc46e06",
  "a6c085a1b85dd7e11a12b57341e821e7e57ffa3f54273442dc931a825df49980",
  "d7cf65adc1993c359b266cdf586788e197d57a2221557d93224ca4ac7c58d680",
]);

export function sha256(text: string): string {
  return createHash("sha256").update(text).digest("hex");
}

/** Lowercased words and adjacent word pairs, the shapes a denylist term takes. */
export function candidateTerms(text: string): Set<string> {
  const words = text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
  const terms = new Set(words);
  for (let i = 1; i < words.length; i++) {
    terms.add(`${words[i - 1]} ${words[i]}`);
  }
  return terms;
}

/** Hashes of every denylisted term found in the text. */
export function findDenylistedTerms(
  text: string,
  denylist: ReadonlySet<string> = DENYLIST_HASHES,
): string[] {
  return [...candidateTerms(text)]
    .map(sha256)
    .filter((hash) => denylist.has(hash));
}

/** SVG geometry attributes (path data, viewBox, points): coordinates, not text. */
const SVG_GEOMETRY = /\b(?:d|viewBox|points)=(?:"[^"]*"|'[^']*')/g;

/**
 * Anything shaped like a phone number: 10 or more digits, optionally with a
 * leading +, spaces, dots, dashes or parentheses between them. Digits inside
 * a longer word, such as a hash, don't count, and neither does SVG geometry.
 */
export function findPhoneNumbers(text: string): string[] {
  const candidates =
    text
      .replace(SVG_GEOMETRY, "")
      .match(/(?<![\w+])\+?\(?\d[\d\s().-]{8,}\d(?!\w)/g) ?? [];
  return candidates.filter((match) => match.replace(/\D/g, "").length >= 10);
}

export function findEmails(text: string): string[] {
  return text.match(/[\w.+-]+@[\w-]+(?:\.[\w-]+)+/g) ?? [];
}
