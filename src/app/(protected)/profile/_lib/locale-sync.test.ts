import { beforeEach, describe, expect, it, vi } from "vitest";
import { syncSavedLocale } from "./locale-sync";

describe("syncSavedLocale", () => {
  beforeEach(() => {
    // biome-ignore lint/suspicious/noDocumentCookie: Reset the cookie the helper writes.
    document.cookie = "NEXT_LOCALE=; Path=/; Max-Age=0";
  });

  it("leaves the cookie alone when the saved locale is already active", () => {
    const refresh = vi.fn();

    expect(syncSavedLocale("en", "en", refresh)).toBe(false);
    expect(document.cookie).not.toContain("NEXT_LOCALE=en");
    expect(refresh).not.toHaveBeenCalled();
  });

  it("stores a differing saved locale and refreshes", () => {
    const refresh = vi.fn();

    expect(syncSavedLocale("pt-BR", "en", refresh)).toBe(true);
    expect(document.cookie).toContain("NEXT_LOCALE=pt-BR");
    expect(refresh).toHaveBeenCalledOnce();
  });
});
