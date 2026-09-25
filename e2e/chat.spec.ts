import { expect, test, type Page } from "@playwright/test";

// The server runs with CHAT_MODEL_MOCK=1 (playwright.config.ts). See lib/agent/model.ts.
const MOCK_TEXT = "mock answer from the test model";
const SLOW = "[slow]";

const input = (page: Page) =>
  page.getByRole("textbox", { name: "Ask a question about James" });
const announcer = (page: Page) => page.locator('[aria-live="polite"]');
const answers = (page: Page) =>
  page.getByRole("region", { name: "Conversation" }).getByRole("listitem");

async function ask(page: Page, question: string) {
  await input(page).fill(question);
  await input(page).press("Enter");
}

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("empty state: one question, a labelled input and a suggestion", async ({
  page,
}) => {
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "What do you want to know about James?",
    }),
  ).toBeVisible();
  await expect(input(page)).toBeVisible();
  await expect(
    page.getByRole("button", { name: "What can James do?" }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "New chat" })).toHaveCount(0);
});

test("Enter sends a question and the answer streams in", async ({ page }) => {
  await ask(page, "What has James built?");

  await expect(input(page)).toHaveValue("");
  await expect(answers(page).first()).toContainText("What has James built?");
  await expect(answers(page).last()).toContainText(MOCK_TEXT);
  // Markdown renders as elements, not asterisks.
  await expect(answers(page).last().locator("strong")).toHaveText(
    "mock answer",
  );
  // The finished answer is announced once, as plain text.
  await expect(announcer(page)).toContainText(MOCK_TEXT);
  await expect(announcer(page)).not.toContainText("**");
  // The heading stays for screen readers after the empty state goes.
  await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
});

test("Shift+Enter adds a line instead of sending", async ({ page }) => {
  await input(page).fill("First line");
  await input(page).press("Shift+Enter");
  await input(page).pressSequentially("second line");
  await expect(input(page)).toHaveValue("First line\nsecond line");
  await expect(page.getByRole("region", { name: "Conversation" })).toHaveCount(
    0,
  );
});

test("the suggestion chip asks its question", async ({ page }) => {
  await page.getByRole("button", { name: "What can James do?" }).click();
  await expect(answers(page).first()).toContainText("What can James do?");
  await expect(answers(page).last()).toContainText(MOCK_TEXT);
  await expect(input(page)).toBeFocused();
});

test("Stop ends a streaming answer", async ({ page }) => {
  await ask(page, `Tell me everything ${SLOW}`);

  const stop = page.getByRole("button", { name: "Stop answer" });
  await expect(answers(page).last()).toContainText("word2");
  await stop.click();

  await expect(
    page.getByRole("button", { name: "Send question" }),
  ).toBeVisible();
  await expect(announcer(page)).toHaveText("Answer stopped.");
  await expect(answers(page).last()).not.toContainText("word120");
  // The stopped chat still takes the next question.
  await ask(page, "Next question");
  await expect(answers(page).last()).toContainText(MOCK_TEXT);
});

test("an error shows Retry, and Retry asks again", async ({ page }) => {
  let failed = false;
  await page.route("**/api/chat", async (route) => {
    if (!failed) {
      failed = true;
      await route.fulfill({ status: 500, body: '{"error":"x"}' });
    } else {
      await route.fallback();
    }
  });

  const conversation = page.getByRole("region", { name: "Conversation" });
  await ask(page, "Where is James based?");
  await expect(
    conversation.getByText("The answer couldn't be loaded."),
  ).toBeVisible();
  await expect(announcer(page)).toHaveText("The answer couldn't be loaded.");

  await page.getByRole("button", { name: "Retry" }).click();
  await expect(answers(page).last()).toContainText(MOCK_TEXT);
  await expect(
    conversation.getByText("The answer couldn't be loaded."),
  ).toHaveCount(0);
  // The question is asked again, not duplicated.
  await expect(
    page.getByRole("listitem").filter({ hasText: "Where is James based?" }),
  ).toHaveCount(1);
});

test("New chat returns to the empty state", async ({ page }) => {
  await ask(page, "What has James built?");
  await expect(answers(page).last()).toContainText(MOCK_TEXT);

  await page.getByRole("button", { name: "New chat" }).click();
  await expect(
    page.getByRole("heading", {
      name: "What do you want to know about James?",
    }),
  ).toBeVisible();
  await expect(page.getByRole("region", { name: "Conversation" })).toHaveCount(
    0,
  );
  await expect(input(page)).toBeFocused();
});

test("questions are capped at 1,000 characters, with a count near the limit", async ({
  page,
}) => {
  await input(page).fill("a".repeat(1_200));
  await expect(input(page)).toHaveValue("a".repeat(1_000));
  await expect(page.getByText("1,000 / 1,000")).toBeVisible();
});

test("works by keyboard alone", async ({ page, browserName }) => {
  // Like Safari, WebKit's Tab key skips buttons unless full keyboard access is on.
  test.skip(browserName === "webkit", "Tab skips buttons in WebKit");

  await page.keyboard.press("Tab");
  await expect(input(page)).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("button", { name: "Send question" }),
  ).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("button", { name: "What can James do?" }),
  ).toBeFocused();

  // Asking by keyboard keeps focus in the input for the follow-up.
  await page.keyboard.press("Shift+Tab");
  await page.keyboard.press("Shift+Tab");
  await page.keyboard.type("What has James built?");
  await page.keyboard.press("Enter");
  await expect(answers(page).last()).toContainText(MOCK_TEXT);
  await expect(input(page)).toBeFocused();

  // Stop is reachable from the input, and focus stays on the same button after.
  await page.keyboard.type(`More ${SLOW}`);
  await page.keyboard.press("Enter");
  await expect(answers(page).last()).toContainText("word2");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Stop answer" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("button", { name: "Send question" }),
  ).toBeFocused();
});

test.describe("at 320px", () => {
  test.use({ viewport: { width: 320, height: 640 } });

  test("nothing scrolls sideways, before or after a question", async ({
    page,
  }) => {
    const overflow = () =>
      page.evaluate(
        () =>
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth,
      );
    expect(await overflow()).toBe(0);

    await ask(page, "What has James built?");
    await expect(answers(page).last()).toContainText(MOCK_TEXT);
    expect(await overflow()).toBe(0);
    await expect(input(page)).toBeInViewport();
  });
});
