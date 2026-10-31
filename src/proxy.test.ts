import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import { proxy } from "./proxy";

describe("proxy", () => {
  it("sends the same fresh nonce to the response policy and the render", () => {
    const response = proxy(new NextRequest("https://example.test/sign-in"));
    const policy = response.headers.get("content-security-policy");
    const nonce = response.headers.get("x-middleware-request-x-nonce");

    expect(nonce).toBeTruthy();
    expect(policy).toContain(`'nonce-${nonce}'`);
    expect(
      response.headers.get("x-middleware-request-content-security-policy"),
    ).toBe(policy);

    const next = proxy(new NextRequest("https://example.test/sign-in"));
    expect(next.headers.get("x-middleware-request-x-nonce")).not.toBe(nonce);
  });

  it("only adds headers", () => {
    const response = proxy(new NextRequest("https://example.test/"));
    expect(response.headers.get("x-middleware-next")).toBe("1");
    expect(response.headers.get("x-middleware-rewrite")).toBeNull();
    expect(response.headers.get("location")).toBeNull();
  });
});
