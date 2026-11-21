import { describe, expect, it } from "vitest";
import { env } from "./env";

describe("env configuration", () => {
  it("provides expected environment structure and defaults", () => {
    expect(env).toBeDefined();
    expect(["development", "production", "test"]).toContain(env.NODE_ENV);
  });

  it("exposes optional environment variables as string or undefined", () => {
    expect(
      typeof env.OTEL_SERVICE_NAME === "string" ||
        env.OTEL_SERVICE_NAME === undefined,
    ).toBe(true);
    expect(
      typeof env.NEXT_PUBLIC_GA_ID === "string" ||
        env.NEXT_PUBLIC_GA_ID === undefined,
    ).toBe(true);
  });
});
