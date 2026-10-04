import { expect, test } from "@playwright/test";

test.describe("My Games auth gate", () => {
  test("redirects unauthenticated users to login with callback", async ({
    page,
  }) => {
    await page.goto("/my-games");
    await expect(page).toHaveURL(/\/login/);
    expect(page.url()).toContain("callbackUrl=");
  });

  test("favorites tab deep link stays protected", async ({ page }) => {
    await page.goto("/my-games?tab=favorites");
    await expect(page).toHaveURL(/\/login/);
    expect(page.url()).toContain("tab%3Dfavorites");
  });
});
