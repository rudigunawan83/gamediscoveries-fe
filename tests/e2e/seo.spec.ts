import { expect, test } from "@playwright/test";

test("robots.txt allows public game paths and blocks private", async ({
  request,
}) => {
  const res = await request.get("/robots.txt");
  expect(res.ok()).toBeTruthy();
  const body = await res.text();
  expect(body).toContain("Disallow: /login");
  expect(body).toContain("Disallow: /my-games");
  expect(body).toContain("Sitemap:");
});

test("sitemap is available", async ({ request }) => {
  const res = await request.get("/sitemap.xml");
  expect(res.ok()).toBeTruthy();
  const body = await res.text();
  expect(body.includes("<urlset") || body.includes("<sitemapindex")).toBe(true);
});

test("search is noindex follow", async ({ page }) => {
  await page.goto("/search?q=test");
  const robots = await page.locator('meta[name="robots"]').getAttribute("content");
  expect(robots ?? "").toMatch(/noindex/i);
});

test("game page exposes title canonical and json-ld", async ({ page }) => {
  await page.goto("/games");
  const firstGame = page.locator('a[href^="/game/"]').first();
  await expect(firstGame).toBeVisible({ timeout: 20_000 });
  await firstGame.click();
  await expect(page).toHaveURL(/\/game\//);

  const title = await page.title();
  expect(title).toMatch(/Play .+ Online|GameDiscoveries/);

  const canonical = page.locator('link[rel="canonical"]');
  await expect(canonical).toHaveAttribute("href", /\/game\//);

  const jsonLd = page.locator('script[type="application/ld+json"]');
  await expect(jsonLd.first()).toBeAttached();
});
