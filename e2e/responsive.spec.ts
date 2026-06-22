import { test, expect } from "@playwright/test";

test.describe("home responsiveness", () => {
  test("no horizontal overflow", async ({ page }) => {
    await page.goto("/");
    const overflow = await page.evaluate(() =>
      document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    expect(overflow).toBeLessThanOrEqual(1); // allow sub-pixel rounding
  });

  test("renders all 19 cards", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("article")).toHaveCount(19);
  });

  test("category filter narrows the grid", async ({ page }) => {
    await page.goto("/");
    // Use exact: true to distinguish the FilterBar chip from cadence dots whose
    // aria-labels contain the category name as a substring (e.g. "Hotjar Blocker,
    // 9 NOV 2025, Extension. View project.").
    await page.getByRole("button", { name: "Extension", exact: true }).click();
    await expect(page.locator("article")).toHaveCount(1);
  });

  test("cadence dot click resets filter to All", async ({ page }) => {
    await page.goto("/");
    // Apply a filter first so we can confirm it resets.
    // Use exact: true to distinguish FilterBar chip from cadence dot aria-labels.
    await page.getByRole("button", { name: "Education", exact: true }).click();
    await expect(page.locator("article")).not.toHaveCount(19);
    // Click first cadence dot — aria-label ends with ". View project."
    // The .dot CSS Modules class is hashed, so we target by accessible role+name pattern.
    await page.getByRole("button", { name: /View project/ }).first().click();
    // After reset, all 19 cards should be visible
    await expect(page.locator("article")).toHaveCount(19);
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
