import { describe, expect, it } from "vitest";
import { enableAnalytics, enableTelemetry } from "./flags";

describe("flags configuration", () => {
  it("defines flags matching real project environment variables", async () => {
    expect(enableAnalytics.key).toBe("enable-analytics");
    expect(enableTelemetry.key).toBe("enable-telemetry");

    // The decide functions directly evaluate the environment-backed conditions
    const isAnalytics = await enableAnalytics.decide?.({} as never);
    const isTelemetry = await enableTelemetry.decide?.({} as never);

    expect(typeof isAnalytics).toBe("boolean");
    expect(typeof isTelemetry).toBe("boolean");
  });
});
