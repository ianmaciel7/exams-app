import { expect, test } from "@playwright/test";

test.describe("Home Page and Health Check", () => {
  test("renders meaningful home page content", async ({ page }) => {
    const response = await page.goto("/");

    expect(response?.ok()).toBeTruthy();
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "To get started, edit the",
    );
    await expect(
      page.getByRole("link", { name: "Documentation" }),
    ).toHaveAttribute("href", /^https:\/\/nextjs\.org\/docs/);
  });

  test("returns health status ok", async ({ request }) => {
    const health = await request.get("/api/health");
    expect(health.ok()).toBeTruthy();
    expect(await health.json()).toEqual({ status: "ok" });
  });
});
