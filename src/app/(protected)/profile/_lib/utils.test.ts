import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  ACCEPTED_AVATAR_TYPES,
  getAvatarFallbackInitial,
  getAvatarSource,
  isValidAvatarFile,
  MAX_AVATAR_SIZE,
  syncSavedLocale,
} from "./utils";

describe("avatar source selection", () => {
  it("prioritizes an unsaved preview over the stored avatar", () => {
    expect(
      getAvatarSource("blob:preview", "https://example.test/avatar", 3),
    ).toBe("blob:preview");
  });
  it("keeps missing photos absent and unversioned URLs unchanged", () => {
    expect(getAvatarSource(null, null, 2)).toBeUndefined();
    expect(getAvatarSource(null, "https://example.test/avatar", 0)).toBe(
      "https://example.test/avatar",
    );
  });
  it.each([
    ["https://example.test/avatar", "https://example.test/avatar?v=3"],
    [
      "https://example.test/avatar?token=abc",
      "https://example.test/avatar?token=abc&v=3",
    ],
  ])(
    "adds a cache version while preserving existing query parameters: %s",
    (url, expected) => {
      expect(getAvatarSource(null, url, 3)).toBe(expected);
    },
  );
  it("preserves avatar upload limits", () => {
    expect(MAX_AVATAR_SIZE).toBe(2 * 1024 * 1024);
    expect([...ACCEPTED_AVATAR_TYPES]).toEqual([
      "image/jpeg",
      "image/png",
      "image/webp",
    ]);
  });
});

describe("avatar file validation", () => {
  it("accepts supported types within the size limit", () => {
    expect(
      isValidAvatarFile({ type: "image/png", size: MAX_AVATAR_SIZE }),
    ).toBe(true);
  });
  it("rejects unsupported types and oversized files", () => {
    expect(isValidAvatarFile({ type: "image/gif", size: 1 })).toBe(false);
    expect(
      isValidAvatarFile({ type: "image/png", size: MAX_AVATAR_SIZE + 1 }),
    ).toBe(false);
  });
});

describe("avatar fallback initial", () => {
  it("prefers the display name, then the email, then U", () => {
    expect(getAvatarFallbackInitial("ana", "z@x.test")).toBe("A");
    expect(getAvatarFallbackInitial(null, "z@x.test")).toBe("Z");
    expect(getAvatarFallbackInitial("", null)).toBe("U");
  });
});

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
