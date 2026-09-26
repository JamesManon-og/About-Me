import type { Page } from "@playwright/test";

// Browser warnings about valid markup, not page errors. WebKit doesn't know the
// `interactive-widget` viewport key (Chrome on Android uses it) and logs it as an error.
const IGNORED = [/Viewport argument key "interactive-widget" not recognized/];

/** Collects console errors and uncaught exceptions for the page. */
export function collectErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() !== "error") return;
    const text = message.text();
    if (!IGNORED.some((pattern) => pattern.test(text))) errors.push(text);
  });
  page.on("pageerror", (error) => errors.push(error.message));
  return errors;
}
