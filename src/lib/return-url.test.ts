import { describe, expect, it } from "vitest";
import { getSafeReturnUrl } from "./return-url";

describe("getSafeReturnUrl", () => {
  it.each([
    ["/profile", "/profile"],
    ["/settings?tab=security", "/settings?tab=security"],
    ["/notes/42?sort=latest#details", "/notes/42?sort=latest#details"],
    [null, "/"],
    ["https://evil.example/steal", "/"],
    ["//evil.example/steal", "/"],
    ["/\\evil.example", "/"],
    ["/sign-in", "/"],
    ["/register?next=/profile", "/"],
    ["/forgot-password", "/"],
    ["/Sign-In", "/"],
    ["/REGISTER?next=/profile", "/"],
    ["/Forgot-Password", "/"],
    ["/%2e%2e/sign-in", "/"],
  ])("resolves %s to %s", (input, expected) => {
    expect(getSafeReturnUrl(input)).toBe(expected);
  });
});
