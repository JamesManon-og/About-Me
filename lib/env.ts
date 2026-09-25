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
  /** Set by Vercel on deployments. Absent locally. */
  VERCEL_ENV: z.enum(["development", "preview", "production"]).optional(),
  /**
   * Optional so the build and CI run without it. The chat route answers 503 when it is
   * missing and the mock model is off.
   */
  ANTHROPIC_API_KEY: z.string().min(1).optional(),
  /** Overrides the chat model. lib/agent/model.ts holds the default. */
  CHAT_MODEL: z
    .enum(["claude-haiku-4-5", "claude-sonnet-5", "claude-opus-5"])
    .optional(),
  /**
   * "1" swaps Claude for a scripted mock model, for e2e tests and for working on the UI
   * without a key. Refused on a Vercel production deployment.
   */
  CHAT_MODEL_MOCK: z.literal("1").optional(),
  // Stage 7: UPSTASH_REDIS_REST_URL: z.url(),
  // Stage 7: UPSTASH_REDIS_REST_TOKEN: z.string().min(1),
});

export const publicSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.url().optional(),
});

const envSchema = z
  .object({
    ...serverSchema.shape,
    ...publicSchema.shape,
  })
  .refine((env) => !(env.CHAT_MODEL_MOCK && env.VERCEL_ENV === "production"), {
    message: "CHAT_MODEL_MOCK must not be set on a production deployment",
    path: ["CHAT_MODEL_MOCK"],
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
    VERCEL_ENV: process.env.VERCEL_ENV,
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
    CHAT_MODEL: process.env.CHAT_MODEL,
    CHAT_MODEL_MOCK: process.env.CHAT_MODEL_MOCK,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  };
}

export const env = parseEnv(readSource());
