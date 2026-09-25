import type { ModelMessage } from "ai";
import { z } from "zod";
import { LIMITS } from "./limits";

/**
 * Validates the body `useChat` posts to /api/chat and turns it into model messages.
 *
 * Only text reaches the model: every other part type (files, tool parts, step markers)
 * is dropped, so a forged body cannot smuggle anything else in. Rate limits and the
 * rest of abuse protection are Stage 7.
 */

export { LIMITS };

const PartSchema = z.object({ type: z.string(), text: z.string().optional() });

const MessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  parts: z.array(PartSchema).max(50),
});

const BodySchema = z.object({
  messages: z.array(MessageSchema).min(1).max(200),
});

export type ChatRequestResult =
  | { ok: true; messages: ModelMessage[] }
  | { ok: false; status: 400 | 413; error: string };

const fail = (error: string, status: 400 | 413 = 400): ChatRequestResult => ({
  ok: false,
  status,
  error,
});

function textOf(parts: z.infer<typeof PartSchema>[]): string {
  return parts
    .filter((part) => part.type === "text")
    .map((part) => part.text ?? "")
    .join("");
}

/** Validates an already-parsed body. Exported for tests. */
export function toModelMessages(body: unknown): ChatRequestResult {
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) return fail("Invalid request.");

  // Keep the tail, and start on a user turn: the model API requires it.
  let recent = parsed.data.messages.slice(-LIMITS.history);
  const firstUser = recent.findIndex((m) => m.role === "user");
  if (firstUser === -1) return fail("Send a question.");
  recent = recent.slice(firstUser);

  const messages: ModelMessage[] = [];
  for (const message of recent) {
    const text = textOf(message.parts).trim();
    const limit =
      message.role === "user" ? LIMITS.userChars : LIMITS.assistantChars;
    if (text.length > limit) {
      return fail(
        message.role === "user"
          ? `Keep questions under ${LIMITS.userChars.toLocaleString("en")} characters.`
          : "Invalid request.",
      );
    }
    // An empty earlier answer (for example, one stopped before any text) is skipped.
    if (!text) {
      if (message.role === "user") return fail("Send a question.");
      continue;
    }
    messages.push({ role: message.role, content: text });
  }

  if (messages.at(-1)?.role !== "user") return fail("Send a question.");
  return { ok: true, messages };
}

/** Reads, size-checks and validates the request body. */
export async function parseChatRequest(
  request: Request,
): Promise<ChatRequestResult> {
  const declared = Number(request.headers.get("content-length") ?? 0);
  if (declared > LIMITS.bodyBytes) return fail("Request too large.", 413);

  const raw = await request.text();
  if (raw.length > LIMITS.bodyBytes) return fail("Request too large.", 413);

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return fail("Invalid request.");
  }
  return toModelMessages(body);
}
