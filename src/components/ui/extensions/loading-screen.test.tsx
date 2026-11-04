import { cleanup, render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, expect, it } from "vitest";
import { LoadingScreen } from "./loading-screen";

afterEach(cleanup);

it("announces the translated label once and hides the decorative spinner", () => {
  render(
    <NextIntlClientProvider
      locale="en"
      messages={{ App: { loading: "Loading…" } }}
    >
      <LoadingScreen />
    </NextIntlClientProvider>,
  );
  const status = screen.getByRole("status");
  expect(status.textContent).toBe("Loading…");
  expect(status.getAttribute("aria-live")).toBe("polite");
  expect(status.querySelector("svg")?.getAttribute("aria-hidden")).toBe("true");
  expect(status.className).toContain("fixed");
});
