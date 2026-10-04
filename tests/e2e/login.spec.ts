import { expect, test } from "@playwright/test";

test("login page shows validation and API error for invalid credentials", async ({
  page,
}) => {
  await page.goto("/login");

  await expect(
    page.getByRole("heading", { name: /Welcome/i }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: /Sign In/i }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Sign In" }).click();
  await expect(page.getByText("Email is required.")).toBeVisible();
  await expect(page.getByText("Password is required.")).toBeVisible();

  await page.getByRole("textbox", { name: "Email" }).fill("player@example.com");
  await page.locator("#login-password").fill("definitely-wrong-password");
  await page.getByRole("button", { name: "Sign In" }).click();

  await expect(
    page.getByRole("alert").filter({
      hasText:
        /Invalid email or password|Sign-in is not available yet|Unable to sign in|Unable to reach the server/i,
    }),
  ).toBeVisible({ timeout: 15_000 });
});

test("unauthenticated my-games redirects to login with callback", async ({
  page,
}) => {
  await page.goto("/my-games");
  await expect(page).toHaveURL(/\/login\?callbackUrl=%2Fmy-games/);
  await expect(page.getByRole("heading", { name: /Sign In/i })).toBeVisible();
});
