import { expect, test } from "@playwright/test";

test("homepage loads with hero and game cards", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: /Discover Your Next Game/i }),
  ).toBeVisible();

  await expect(page.getByRole("heading", { name: "Trending Now" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Neon Drift Racers/i }).first()).toBeVisible();
});

test("navigation and game detail work", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("navigation", { name: "Primary" }).getByRole("link", { name: "Games" }).click();
  await expect(page).toHaveURL(/\/games/);

  await page.getByRole("link", { name: /Neon Drift Racers/i }).first().click();
  await expect(page).toHaveURL(/\/game\/neon-drift-racers/);
  await expect(page.getByRole("heading", { name: "Neon Drift Racers" })).toBeVisible();
});
