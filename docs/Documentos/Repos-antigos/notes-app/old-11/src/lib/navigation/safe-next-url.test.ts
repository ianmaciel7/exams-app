import { describe, expect, it } from "vitest";
import { getSafeNextUrl } from "./safe-next-url";

describe("getSafeNextUrl", () => {
  it("keeps internal application paths", () => {
    expect(getSafeNextUrl("/dashboard?tab=progress#today")).toBe(
      "/dashboard?tab=progress#today"
    );
  });

  it.each([
    "javascript:alert(1)",
    "https://evil.example/phish",
    "//evil.example/phish",
    "/\\\\evil.example/phish",
    "data:text/html,<script>alert(1)</script>",
  ])("rejects unsafe redirect target %s", (candidate) => {
    expect(getSafeNextUrl(candidate)).toBe("/");
  });

  it("falls back to home when no redirect target is provided", () => {
    expect(getSafeNextUrl(null)).toBe("/");
  });
});
