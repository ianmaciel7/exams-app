import { describe, expect, it } from "vitest";
import { getAuthLinkHref, getSafeReturnUrl } from "./return-url";

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

describe("getAuthLinkHref", () => {
  it.each([
    [undefined, "/register"],
    [
      "/profile?tab=security",
      `/register?next=${encodeURIComponent("/profile?tab=security")}`,
    ],
    [
      ["/profile", "/other"],
      `/register?next=${encodeURIComponent("/profile")}`,
    ],
    ["https://evil.example", "/register"],
    ["/sign-in", "/register"],
  ])("builds the href for next=%j", (next, href) => {
    expect(getAuthLinkHref("/register", next)).toBe(href);
  });
});
