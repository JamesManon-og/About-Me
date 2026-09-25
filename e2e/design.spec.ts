import { expect, test } from "@playwright/test";

test.describe("/design preview", () => {
  test("renders without console errors and is not indexed", async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    page.on("pageerror", (error) => errors.push(error.message));

    await page.goto("/design");

    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Design system",
    );
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      "content",
      /noindex/,
    );
    expect(errors).toEqual([]);
  });

  for (const scheme of ["light", "dark"] as const) {
    test(`forces each panel's theme when the OS prefers ${scheme}`, async ({
      page,
    }) => {
      await page.emulateMedia({ colorScheme: scheme });
      await page.goto("/design");

      const background = (theme: string) =>
        page
          .getByTestId(`panel-${theme}`)
          .first()
          .evaluate((el) => getComputedStyle(el).backgroundColor);

      // --paper in globals.css: #f6f1e7 light, #141a26 dark
      expect(await background("light")).toBe("rgb(246, 241, 231)");
      expect(await background("dark")).toBe("rgb(20, 26, 38)");
    });
  }

  test("shows a visible focus ring on keyboard focus", async ({
    page,
    browserName,
  }) => {
    // Like Safari, WebKit's Tab key skips buttons unless full keyboard access is on.
    test.skip(browserName === "webkit", "Tab skips buttons in WebKit");
    await page.goto("/design");

    // Start sequential focus at the group heading, then Tab into the light panel.
    await page.getByRole("heading", { name: "Buttons and chips" }).click();
    await page.keyboard.press("Tab");

    const primary = page
      .getByTestId("panel-light")
      .getByRole("button", { name: "Primary" });
    await expect(primary).toBeFocused();
    const outline = await primary.evaluate((el) => {
      const style = getComputedStyle(el);
      return `${style.outlineStyle} ${style.outlineWidth} ${style.outlineColor}`;
    });
    // --focus (terracotta) in the light theme
    expect(outline).toBe("solid 2px rgb(168, 72, 42)");
  });

  for (const reducedMotion of ["reduce", "no-preference"] as const) {
    test(`motion durations with reduced motion: ${reducedMotion}`, async ({
      page,
    }) => {
      await page.emulateMedia({ reducedMotion });
      await page.goto("/design");
      // The CSS minifier may rewrite units (0ms → 0s, 550ms → .55s).
      const seconds = await page.evaluate(() => {
        const raw = getComputedStyle(document.documentElement)
          .getPropertyValue("--duration-editorial")
          .trim();
        const value = parseFloat(raw);
        return raw.endsWith("ms") ? value / 1000 : value;
      });
      expect(seconds).toBe(reducedMotion === "reduce" ? 0 : 0.55);
    });
  }
});
