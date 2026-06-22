import { test, expect } from "@playwright/test";

test.describe("home responsiveness", () => {
  test("no horizontal overflow", async ({ page }) => {
    await page.goto("/");
    const overflow = await page.evaluate(() =>
      document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    expect(overflow).toBeLessThanOrEqual(1); // allow sub-pixel rounding
  });

  test("hero headline is visible", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: /real products/i })
    ).toBeVisible();
  });

  test("renders all 18 cards in the log", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("article")).toHaveCount(18);
  });

  test("category filter narrows the grid", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Extension", exact: true }).click();
    await expect(page.locator("article")).toHaveCount(1);
  });

  test("clearing a filter restores all 18 cards", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Education", exact: true }).click();
    await expect(page.locator("article")).not.toHaveCount(18);
    await page.getByRole("button", { name: "All", exact: true }).click();
    await expect(page.locator("article")).toHaveCount(18);
  });

  test("first row starts open and rows behave as a single-open accordion", async ({ page }) => {
    await page.goto("/");
    // the first row in the (shuffled) list is pre-expanded — exactly one open panel on load
    await expect(page.locator("details[open]")).toHaveCount(1);
    // open a currently-closed row; the accordion keeps exactly one open
    const closedSummary = page.locator("article:not(:has(details[open])) summary").first();
    await closedSummary.click();
    await expect(page.locator("details[open]")).toHaveCount(1);
  });
});

test("detail page renders and has no overflow", async ({ page }) => {
  await page.goto("/projects/cycle/");
  await expect(page.getByRole("heading", { name: /CYCLE/i })).toBeVisible();
  const overflow = await page.evaluate(() =>
    document.documentElement.scrollWidth - document.documentElement.clientWidth
  );
  expect(overflow).toBeLessThanOrEqual(1);
});
