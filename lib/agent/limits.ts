/**
 * Request limits, shared by the chat route and the composer. Kept free of imports so the
 * client bundle does not pull in the validation code.
 */
export const LIMITS = {
  /** Characters in one visitor message. */
  userChars: 1_000,
  /** Characters in one earlier answer sent back as history. Real answers are far shorter. */
  assistantChars: 8_000,
  /** Messages kept from the end of the conversation. */
  history: 20,
  /** Raw body size, checked before parsing. */
  bodyBytes: 200_000,
} as const;
