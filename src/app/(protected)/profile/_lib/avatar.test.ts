import { describe, expect, it } from "vitest";
import {
  ACCEPTED_AVATAR_TYPES,
  getAvatarSource,
  MAX_AVATAR_SIZE,
} from "./avatar";

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
