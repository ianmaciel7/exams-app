import { expect, test } from "@playwright/test";

test.describe("Authentication Flow", () => {
  test("navigates to /login page and renders login UI elements", async ({
    page,
  }) => {
    await page.goto("/login");

    await expect(page).toHaveURL(/\/login/);

    // Verify card title element exists (renders card-title slot)
    const cardTitle = page.locator('[data-slot="card-title"]');
    await expect(cardTitle).toBeVisible();

    // Verify email and password form inputs exist
    const emailInput = page.locator("#email");
    const passwordInput = page.locator("#password");
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();

    // Verify sign in submit button exists
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeVisible();

    // Verify guest authentication button exists
    const guestButton = page.getByTestId("login-shell-anonymous-sign-in-btn");
    await expect(guestButton).toBeVisible();
  });

  test("toggles between sign in and sign up screens", async ({ page }) => {
    await page.goto("/login");

    const signUpToggle = page.getByTestId("login-form-mode-toggle");
    await expect(signUpToggle).toBeVisible();
    await signUpToggle.click();
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeVisible();
  });

  test("completes guest authentication navigation flow and sign out", async ({
    page,
  }) => {
    await page.goto("/login");

    // Click guest authentication button
    const guestButton = page.getByTestId("login-shell-anonymous-sign-in-btn");
    await expect(guestButton).toBeVisible();
    await guestButton.click();

    // Should redirect to home page "/"
    await page.waitForURL("/");

    // Verify authenticated user menu is rendered
    const userMenu = page.getByTestId("user-menu");
    await expect(userMenu).toBeVisible();

    // Verify sign out button is present and click it
    const signOutBtn = page.getByTestId("user-menu-sign-out-btn");
    await expect(signOutBtn).toBeVisible();
    await signOutBtn.click();

    // Verify user is signed out and login link is back
    const loginLink = page.getByTestId("user-menu-login-link");
    await expect(loginLink).toBeVisible();
  });
});
