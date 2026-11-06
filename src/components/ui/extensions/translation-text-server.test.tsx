import { describe, expect, it, vi } from "vitest";
import { TranslationTextServer } from "./translation-text-server";

vi.mock("server-only", () => ({}));
vi.mock("next-intl/server", () => ({
  getTranslations: async () =>
    Object.assign(
      (key: string, values?: Record<string, string>) =>
        values
          ? `translated:${key}:${JSON.stringify(values)}`
          : `translated:${key}`,
      { has: (key: string) => key === "Home.friend" },
    ),
}));

describe("TranslationTextServer", () => {
  it("resolves the message key on the server", async () => {
    expect(
      await TranslationTextServer({ message: "Auth.personalInfoTitle" }),
    ).toBe("translated:Auth.personalInfoTitle");
  });

  it("passes free text values through unchanged", async () => {
    expect(
      await TranslationTextServer({
        message: "Home.welcome",
        values: { name: "Dr. Ada" },
      }),
    ).toBe('translated:Home.welcome:{"name":"Dr. Ada"}');
  });

  it("translates values that are catalog keys", async () => {
    expect(
      await TranslationTextServer({
        message: "Home.welcome",
        values: { name: "Home.friend" },
      }),
    ).toBe('translated:Home.welcome:{"name":"translated:Home.friend"}');
  });
});
