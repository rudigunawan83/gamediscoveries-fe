import { expect, test } from "@playwright/test";

test("game detail play now opens player route", async ({ page }) => {
  await page.goto("/games");

  const firstGame = page.locator('a[href^="/game/"]').first();
  await expect(firstGame).toBeVisible({ timeout: 30_000 });
  await firstGame.click();

  await expect(page).toHaveURL(/\/game\/[^/]+$/);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

  const playNow = page.getByRole("link", { name: /play now/i });
  await expect(playNow).toBeVisible();
  await playNow.click();

  await expect(page).toHaveURL(/\/game\/[^/]+\/play$/);
  await expect(page.getByRole("banner").or(page.locator("header")).first()).toBeVisible();
  await expect(
    page.getByRole("button", { name: /fullscreen/i }).or(
      page.getByRole("link", { name: /back to game/i }),
    ),
  ).toBeVisible();

  await page.getByRole("link", { name: /back to game details/i }).click();
  await expect(page).toHaveURL(/\/game\/[^/]+$/);
});
