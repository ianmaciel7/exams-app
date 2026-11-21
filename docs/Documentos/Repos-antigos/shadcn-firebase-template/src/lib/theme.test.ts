import { describe, expect, it } from "vitest";
import { isThemePreference, themePreferences } from "./theme";

describe("theme", () => {
  it("defines the expected theme options", () => {
    expect(themePreferences).toEqual(["light", "dark", "system"]);
  });

  it("validates valid theme preferences", () => {
    expect(isThemePreference("light")).toBe(true);
    expect(isThemePreference("dark")).toBe(true);
    expect(isThemePreference("system")).toBe(true);
  });

  it("rejects invalid values", () => {
    expect(isThemePreference("dim")).toBe(false);
    expect(isThemePreference("")).toBe(false);
    expect(isThemePreference(null)).toBe(false);
    expect(isThemePreference(undefined)).toBe(false);
    expect(isThemePreference(123)).toBe(false);
  });
});
