import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { topics } from "../src/content";

// Slice 001 - the home topic grid, against a production build.
// Links point at /topics/<id>, which slice 002 builds: check href only, don't click through.

test.describe("home topic grid", () => {
  test("shows one card per topic in the content file", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("list").getByRole("listitem")).toHaveCount(topics.length);
    expect(topics).toHaveLength(6);
  });

  for (const topic of topics) {
    test(`card for ${topic.id} shows icon, title, description and difficulty, and links to its topic`, async ({
      page,
    }) => {
      await page.goto("/");
      const title = page.getByRole("heading", { level: 2, name: topic.title, exact: true });
      await expect(title).toHaveCount(1);
      const card = page.getByRole("link").filter({ has: title });
      await expect(card).toContainText(topic.icon);
      await expect(card).toContainText(topic.description);
      await expect(card).toContainText(topic.difficulty);
      await expect(card).toHaveAttribute("href", `/topics/${topic.id}`);
    });
  }

  test("is server-rendered: all cards are present with JavaScript disabled", async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    try {
      const page = await context.newPage();
      await page.goto("/");
      await expect(page.getByRole("list").getByRole("listitem")).toHaveCount(topics.length);
    } finally {
      await context.close();
    }
  });

  test("has no axe accessibility violations", async ({ page }) => {
    await page.goto("/");
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
});

for (const width of [375, 768, 1280]) {
  test.describe(`at ${width}px wide`, () => {
    test.use({ viewport: { width, height: 800 } });

    test("the grid has no horizontal scroll", async ({ page }) => {
      await page.goto("/");
      await expect(page.getByRole("list").getByRole("listitem")).toHaveCount(topics.length);
      const { scrollWidth, clientWidth } = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
    });
  });
}
