import { expect, test } from "@playwright/test";

test.describe("Community", () => {
  test("community home is reachable", async ({ page }) => {
    await page.goto("/community");
    await expect(page.getByRole("heading", { name: "Community" })).toBeVisible();
    await expect(
      page.getByText("What's happening in GameDiscoveries?"),
    ).toBeVisible();
  });

  test("leaderboards page renders", async ({ page }) => {
    await page.goto("/community/leaderboards");
    await expect(
      page.getByRole("heading", { name: "Leaderboards" }),
    ).toBeVisible();
  });
});
