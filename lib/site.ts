import { env } from "@/lib/env";
import { knowledge } from "@/lib/knowledge/james";

/** Site-wide facts for metadata, the sitemap and structured data. Server-only. */

export const SITE = {
  name: knowledge.profile.name,
  title: `${knowledge.profile.name}: ask about his work`,
  description: `Ask anything about ${knowledge.profile.name}, a full-stack developer in Davao City, Philippines. Answers come from his resume, his projects and his own answers.`,
} as const;

/**
 * The canonical origin: NEXT_PUBLIC_SITE_URL, else Vercel's production domain, else
 * localhost for development.
 */
export function siteUrl(): URL {
  if (env.NEXT_PUBLIC_SITE_URL) return new URL(env.NEXT_PUBLIC_SITE_URL);
  if (env.VERCEL_PROJECT_PRODUCTION_URL) {
    return new URL(`https://${env.VERCEL_PROJECT_PRODUCTION_URL}`);
  }
  return new URL("http://localhost:3000");
}

/** schema.org Person, built only from verified knowledge. */
export function personJsonLd(url: URL = siteUrl()) {
  const { profile, links } = knowledge;
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.name,
    url: url.toString(),
    email: `mailto:${profile.contact.email}`,
    jobTitle: "Full-stack developer",
    // The headline's first sentence; the rest is in his first person.
    description: `${profile.headline.text.split(". ")[0]}.`,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Davao City",
      addressCountry: "PH",
    },
    alumniOf: profile.education.map((e) => ({
      "@type": "CollegeOrUniversity",
      name: e.school,
    })),
    knowsAbout: ["TypeScript", "Python", "Java"],
    sameAs: links.filter((l) => l.kind === "profile").map((l) => l.url),
  };
}

/** JSON for a <script type="application/ld+json">, with "<" escaped against injection. */
export function jsonLdScript(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
