import { describe, expect, it } from "vitest";
import { cspHeader, nonceHeader, securityHeaders } from "./headers";

describe("headers module", () => {
  it("exports canonical header names", () => {
    expect(nonceHeader).toBe("x-nonce");
    expect(cspHeader).toBe("Content-Security-Policy");
  });

  it("exports baseline security headers with essential policies", () => {
    expect(securityHeaders).toBeInstanceOf(Array);
    const headerMap = Object.fromEntries(
      securityHeaders.map((h) => [h.key, h.value]),
    );
    expect(headerMap["X-Content-Type-Options"]).toBe("nosniff");
    expect(headerMap["X-Frame-Options"]).toBe("SAMEORIGIN");
    expect(headerMap["Strict-Transport-Security"]).toContain("max-age=");
    expect(headerMap["Content-Security-Policy"]).toContain("frame-ancestors");
  });
});
