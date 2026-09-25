import { describe, expect, it } from "vitest";
import { markdownToPlainText } from "./plain-text";

describe("markdownToPlainText", () => {
  it("strips emphasis, code and link syntax", () => {
    expect(
      markdownToPlainText(
        "**MoneyApp** is *live* at [moneyapp.click](https://moneyapp.click) and uses `Bun`.",
      ),
    ).toBe("MoneyApp is live at moneyapp.click and uses Bun.");
  });

  it("drops list markers and blank lines", () => {
    expect(
      markdownToPlainText("Projects:\n\n- MoneyApp\n- JobPilot\n1. ADTO"),
    ).toBe("Projects:\nMoneyApp\nJobPilot\nADTO");
  });

  it("leaves plain text and email addresses alone", () => {
    const text =
      "I don't have that information. You can ask James directly at jamesmanonog@gmail.com.";
    expect(markdownToPlainText(text)).toBe(text);
  });

  it("does not treat a lone asterisk or multiplication as emphasis", () => {
    expect(markdownToPlainText("2 * 3 = 6")).toBe("2 * 3 = 6");
  });
});
