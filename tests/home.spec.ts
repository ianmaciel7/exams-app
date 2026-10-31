import { expect, test } from "@playwright/test";
import { defaultLocale, localeCookie, locales } from "../src/i18n/routing";
import en from "../src/messages/en.json";
import es from "../src/messages/es.json";
import ptBR from "../src/messages/pt-BR.json";

// The document title is the localized Metadata.title, not the package name.
const titles: Record<(typeof locales)[number], string> = {
  en: en.Metadata.title,
  es: es.Metadata.title,
  "pt-BR": ptBR.Metadata.title,
};

test.describe("home page smoke tests", () => {
  test("serves a usable page with document metadata", async ({ page }) => {
    const response = await page.goto("/");
    expect(response?.ok()).toBe(true);
    await expect(page.locator("main")).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
    await expect(page).toHaveTitle(titles[defaultLocale]);
  });

  test("protects links that open a new tab", async ({ page }) => {
    await page.goto("/");
    const links = page.locator('a[target="_blank"]');
    const count = await links.count();
    for (let i = 0; i < count; i++) {
      await expect(links.nth(i)).toHaveAttribute("rel", /\bnoopener\b/);
    }
  });

  for (const locale of locales) {
    test(`serves the configured locale ${locale} without an error`, async ({
      context,
      page,
    }) => {
      await context.addCookies([
        {
          name: localeCookie,
          value: locale,
          url: "http://127.0.0.1:4173",
        },
      ]);
      const response = await page.goto("/");
      expect(response?.ok()).toBe(true);
      await expect(page.locator("main")).toBeVisible();
      await expect(page.locator("html")).toHaveAttribute("lang", locale);
      await expect(page).toHaveTitle(titles[locale]);
      // Verify the original server HTML, not a client-side attribute patch.
      const initialResponse = await context.request.get("/");
      expect(initialResponse.ok()).toBe(true);
      const initialHtml = await initialResponse.text();
      expect(initialHtml.match(/<html[^>]*\slang="([^"]+)"/)?.[1]).toBe(locale);
      const htmlTagCount = [...initialHtml.matchAll(/<html\b[^>]*>/g)].length;
      expect(htmlTagCount).toBe(1);
    });
  }

  test("serves the page without errors for an unsupported locale cookie", async ({
    context,
    page,
  }) => {
    await context.addCookies([
      {
        name: localeCookie,
        value: "unsupported-locale",
        url: "http://127.0.0.1:4173",
      },
    ]);
    const response = await page.goto("/");
    expect(response?.ok()).toBe(true);
    await expect(page.locator("main")).toBeVisible();
  });
});
