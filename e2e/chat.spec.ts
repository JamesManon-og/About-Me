import { expect, test, type Page } from "@playwright/test";

// The server runs with CHAT_MODEL_MOCK=1 (playwright.config.ts). See lib/agent/model.ts.
// Questions the prebuilt answer set covers get approved answers; anything else goes to
// the mock model, which stands in for Claude.
const MOCK_TEXT = "mock answer from the test model";
const SLOW = "[slow]";
/** A question no prebuilt answer covers, so it reaches the (mock) model. */
const UNMATCHED = "What is the airspeed of an unladen swallow?";
/** A covered question and a phrase from its approved answer. */
const MATCHED = "What has James built?";
const MATCHED_TEXT = "Four you can ask about";
const EMAIL = "jamesmanonog@gmail.com";

const input = (page: Page) =>
  page.getByRole("textbox", { name: "Ask a question about James" });
const announcer = (page: Page) => page.locator('[aria-live="polite"]');
// Only the conversation's own items: an answer can contain a Markdown list of its own.
const answers = (page: Page) =>
  page
    .getByRole("region", { name: "Conversation" })
    .locator(":scope > ol > li");

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
  await ask(page, UNMATCHED);

  await expect(input(page)).toHaveValue("");
  await expect(answers(page).first()).toContainText(UNMATCHED);
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

test("the suggestion chip asks its question and gets the approved answer", async ({
  page,
}) => {
  await page.getByRole("button", { name: "What can James do?" }).click();
  await expect(answers(page).first()).toContainText("What can James do?");
  await expect(answers(page).last()).toContainText(
    "Most of James's work sits where systems meet",
  );
  await expect(input(page)).toBeFocused();
});

test("an approved answer offers related questions, and a chip asks one", async ({
  page,
}) => {
  await ask(page, "Does MoneyApp process payments?");
  await expect(answers(page).last()).toContainText(
    "a claim alone never clears a debt",
  );
  const related = page.getByRole("group", { name: "Related" });
  await expect(related.getByRole("button")).toHaveCount(3);

  await related.getByRole("button", { name: "What is MoneyApp?" }).click();
  await expect(answers(page).last()).toContainText(
    "keeps track of who owes whom",
  );
  await expect(input(page)).toBeFocused();
  // Only the latest answer carries chips.
  await expect(page.getByRole("group", { name: "Related" })).toHaveCount(1);
});

test("a question it can't answer offers the closest questions", async ({
  page,
}) => {
  // Without a key the route answers unmatched questions like this; the e2e server has
  // the mock model instead, so the response is stubbed in the same format.
  await page.route("**/api/chat", (route) =>
    route.fulfill({
      headers: {
        "content-type": "text/event-stream",
        "x-vercel-ai-ui-message-stream": "v1",
      },
      body: [
        { type: "start", messageMetadata: { source: "fallback" } },
        { type: "text-start", id: "answer" },
        {
          type: "text-delta",
          id: "answer",
          delta: `I don't have that information. You can ask James directly at ${EMAIL}.`,
        },
        { type: "text-end", id: "answer" },
        {
          type: "data-suggestions",
          data: {
            kind: "closest",
            questions: ["What can James do?", "How can I contact James?"],
          },
        },
        { type: "finish", finishReason: "stop" },
      ]
        .map((chunk) => `data: ${JSON.stringify(chunk)}\n\n`)
        .concat("data: [DONE]\n\n")
        .join(""),
    }),
  );
  await ask(page, "What's James's favourite IDE?");
  await expect(answers(page).last()).toContainText(
    "I don't have that information",
  );
  await expect(
    page
      .getByRole("group", { name: "Closest questions I can answer" })
      .getByRole("button"),
  ).toHaveCount(2);
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
  await ask(page, UNMATCHED);
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
  await expect(answers(page).last()).toContainText("Davao City");
  await expect(
    conversation.getByText("The answer couldn't be loaded."),
  ).toHaveCount(0);
  // The question is asked again, not duplicated.
  await expect(
    page.getByRole("listitem").filter({ hasText: "Where is James based?" }),
  ).toHaveCount(1);
});

test("New chat returns to the empty state", async ({ page }) => {
  await ask(page, MATCHED);
  await expect(answers(page).last()).toContainText(MATCHED_TEXT);

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
  await page.keyboard.type(MATCHED);
  await page.keyboard.press("Enter");
  await expect(answers(page).last()).toContainText(MATCHED_TEXT);
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

    await ask(page, MATCHED);
    await expect(answers(page).last()).toContainText(MATCHED_TEXT);
    // The answer's chips wrap instead of widening the page.
    await expect(page.getByRole("group", { name: "Related" })).toBeVisible();
    expect(await overflow()).toBe(0);
    await expect(input(page)).toBeInViewport();
  });
});
