import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { GlobalLoadingIndicator } from "./global-loading-indicator";

afterEach(cleanup);

it("announces the label once and hides the decorative spinner", () => {
  render(<GlobalLoadingIndicator label="Loading…" />);
  const status = screen.getByRole("status");
  expect(status.textContent).toBe("Loading…");
  expect(status.getAttribute("aria-live")).toBe("polite");
  expect(status.querySelector("svg")?.getAttribute("aria-hidden")).toBe("true");
  expect(status.closest('[data-slot="loading-overlay"]')?.className).toContain(
    "fixed",
  );
});
