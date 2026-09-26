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

  test("renders all 21 cards in the log", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("article")).toHaveCount(21);
  });

  test("category filter narrows the grid", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Extension", exact: true }).click();
    await expect(page.locator("article")).toHaveCount(1);
  });

  test("clearing a filter restores all 21 cards", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Education", exact: true }).click();
    await expect(page.locator("article")).not.toHaveCount(21);
    await page.getByRole("button", { name: "All", exact: true }).click();
    await expect(page.locator("article")).toHaveCount(21);
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

test("Findra detail page and desk monitor link", async ({ page }) => {
  await page.goto("/projects/findra/");
  await expect(page.getByRole("heading", { name: "Findra" })).toBeVisible();
  await expect(page.getByRole("link", { name: /visit live/i })).toHaveAttribute("href", "https://findra-search.netlify.app/");
  await page.goto("/");
  if (page.viewportSize()!.width >= 768) {
    await page.getByRole("button", { name: /monitor/i }).click();
    await expect(page.getByRole("link", { name: /full story/i })).toHaveAttribute("href", "/projects/findra/");
  } else {
    await page.getByRole("group", { name: "Desk mode" }).getByRole("button", { name: "Dev tools" }).click();
    await expect(page.getByRole("link", { name: "Findra", exact: true })).toHaveAttribute("href", "/projects/findra/");
  }
});
