import { z } from "zod";

/**
 * Environment variables, validated once at module load.
 *
 * Server variables are secrets and must only be read from server code
 * (route handlers, Server Components). Public variables are prefixed with
 * NEXT_PUBLIC_ and inlined into the client bundle at build time, so each one
 * has to be referenced literally in `readSource` below.
 *
 * To add a variable: add it to the matching schema, list it in `readSource`,
 * and document it in `.env.example`.
 */

export const serverSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  // Stage 4: ANTHROPIC_API_KEY: z.string().min(1),
  // Stage 7: UPSTASH_REDIS_REST_URL: z.url(),
  // Stage 7: UPSTASH_REDIS_REST_TOKEN: z.string().min(1),
});

export const publicSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.url().optional(),
});

const envSchema = z.object({
  ...serverSchema.shape,
  ...publicSchema.shape,
});

export type Env = z.infer<typeof envSchema>;

type EnvSource = Record<string, string | undefined>;

/** Validates an env source. Empty strings count as unset. Throws on invalid input. */
export function parseEnv(source: EnvSource): Env {
  const cleaned = Object.fromEntries(
    Object.entries(source).filter(([, value]) => value !== ""),
  );
  const result = envSchema.safeParse(cleaned);
  if (!result.success) {
    throw new Error(
      `Invalid environment variables:\n${z.prettifyError(result.error)}`,
    );
  }
  return result.data;
}

function readSource(): EnvSource {
  return {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  };
}

export const env = parseEnv(readSource());
