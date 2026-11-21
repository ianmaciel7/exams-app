import { expect, it, vi } from "vitest";

it("does not replace or suppress the global error logger on import", async () => {
  const error = vi.spyOn(console, "error").mockImplementation(() => {});
  vi.stubEnv("NODE_ENV", "development");
  try {
    await import("./theme-provider-client");
    expect(console.error).toBe(error);
    console.error("Encountered a script tag from another component");
    expect(error).toHaveBeenCalledWith(
      "Encountered a script tag from another component",
    );
  } finally {
    vi.unstubAllEnvs();
    error.mockRestore();
  }
});
