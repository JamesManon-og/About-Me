import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

// Automated WCAG 2.1 A and AA checks (Stage 8: no serious or critical violations). They
// catch contrast, names, roles and landmarks; the manual screen reader pass still matters.

async function violations(page: Page) {
  const { violations } = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  return violations
    .filter((v) => v.impact === "serious" || v.impact === "critical")
    .map(
      (v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`,
    );
}

for (const colorScheme of ["dark", "light"] as const) {
  test.describe(`${colorScheme} theme`, () => {
    test.use({ colorScheme });

    test("the empty state has no serious violations", async ({ page }) => {
      await page.goto("/");
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      expect(await violations(page)).toEqual([]);
    });

    test("a conversation with chips has no serious violations", async ({
      page,
    }) => {
      await page.goto("/");
      const input = page.getByRole("textbox", {
        name: "Ask a question about James",
      });
      await input.fill("What has James built?");
      await input.press("Enter");
      await expect(page.getByRole("group", { name: "Related" })).toBeVisible();
      expect(await violations(page)).toEqual([]);
    });
  });
}

test("the 404 page has no serious violations", async ({ page }) => {
  await page.goto("/no-such-page");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  expect(await violations(page)).toEqual([]);
});
