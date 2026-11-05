import { describe, expect, it, vi } from "vitest";
import { TranslationTextServer } from "./translation-text-server";

vi.mock("server-only", () => ({}));
vi.mock("next-intl/server", () => ({
  getTranslations: async () => (key: string) => `translated:${key}`,
}));

describe("TranslationTextServer", () => {
  it("resolves the message key on the server", async () => {
    expect(
      await TranslationTextServer({ message: "Auth.personalInfoTitle" }),
    ).toBe("translated:Auth.personalInfoTitle");
  });
});
