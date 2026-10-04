import { expect, test } from "@playwright/test";

test.describe("PWA offline shell", () => {
  test("offline page is reachable", async ({ page }) => {
    await page.goto("/offline");
    await expect(
      page.getByRole("heading", { name: /gone offline/i }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "Retry" })).toBeVisible();
    await expect(page.getByRole("link", { name: "My Games" })).toBeVisible();
  });

  test("home remains crawlable without install", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });
});
