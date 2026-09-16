import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { getTopic, topics } from "../src/content";

// Slice 002 - the topic intro page, against a production build.
// /topics/<id>/quiz is built in slice 003: assert where Start Quiz goes, not what is there.

const space = getTopic("space")!;

test.describe("topic intro: /topics/space", () => {
  test("shows the icon, title, difficulty, description and every fun fact", async ({ page }) => {
    expect(space.funFacts).toHaveLength(4);
    await page.goto("/topics/space");

    const main = page.getByRole("main");
    await expect(page.getByRole("heading", { level: 1, name: space.title, exact: true })).toBeVisible();
    await expect(main).toContainText(space.icon);
    await expect(main).toContainText(space.difficulty);
    await expect(main).toContainText(space.description);

    const facts = page.getByRole("region", { name: "Fun facts" }).getByRole("listitem");
    await expect(facts).toHaveCount(space.funFacts.length);
    for (const [i, fact] of space.funFacts.entries()) {
      await expect(facts.nth(i)).toHaveText(fact);
    }
  });

  test("Start Quiz links to the quiz and can be reached and activated by keyboard", async ({ page }) => {
    await page.goto("/topics/space");
    const start = page.getByRole("link", { name: "Start Quiz" });
    await expect(start).toHaveAttribute("href", "/topics/space/quiz");

    await page.keyboard.press("Tab");
    await expect(page.getByRole("link", { name: "Back to all topics" })).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(start).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/topics\/space\/quiz$/);
  });

  test("the back link returns to the home page", async ({ page }) => {
    await page.goto("/topics/space");
    await page.getByRole("link", { name: "Back to all topics" }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole("heading", { level: 1, name: "Pick a science topic" })).toBeVisible();
  });

  test("sends no quiz questions, options or answers to the browser", async ({ page }) => {
    const response = await page.goto("/topics/space");
    const html = await response!.text();
    // Key names: these fire if the topic object is ever passed as a prop, which is the way the
    // answers would actually escape. Individual option strings are deliberately not asserted -
    // an option like "Earth" is one common word and appears in a fun fact, so asserting it
    // fails on legitimate copy. The question and explanation text below is distinctive enough.
    expect(html).not.toContain("correctIndex");
    expect(html).not.toContain("options");
    for (const q of space.questions) {
      expect(html).not.toContain(q.question);
      expect(html).not.toContain(q.explanation);
    }
  });

  test("has no axe accessibility violations", async ({ page }) => {
    await page.goto("/topics/space");
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
});

test.describe("every topic page is pre-rendered HTML", () => {
  test.use({ javaScriptEnabled: false });

  for (const topic of topics) {
    test(`/topics/${topic.id} renders its title without JavaScript`, async ({ page }) => {
      const response = await page.goto(`/topics/${topic.id}`);
      expect(response?.status()).toBe(200);
      await expect(page.getByRole("heading", { level: 1, name: topic.title, exact: true })).toBeVisible();
    });
  }
});

test.describe("unknown topics", () => {
  test("/topics/not-a-topic loaded directly by URL shows the not-found page with a 404", async ({ page }) => {
    const response = await page.goto("/topics/not-a-topic");
    expect(response?.status()).toBe(404);
    await expect(
      page.getByRole("heading", { level: 1, name: "We couldn't find that page" }),
    ).toBeVisible();
  });

  test("the not-found page offers a way back to the topics", async ({ page }) => {
    await page.goto("/topics/not-a-topic");
    await page.getByRole("link", { name: "Pick a topic" }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole("heading", { level: 1, name: "Pick a science topic" })).toBeVisible();
  });

  test("the not-found page has no axe accessibility violations", async ({ page }) => {
    await page.goto("/topics/not-a-topic");
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
});
