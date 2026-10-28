import { cleanup, render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, describe, expect, it } from "vitest";
import en from "@/messages/en.json";
import { RouteLoading } from "./route-loading";

describe("RouteLoading", () => {
  afterEach(cleanup);

  it("renders loading indicator with default localized label and forwards props", () => {
    render(
      <NextIntlClientProvider locale="en" messages={en}>
        <RouteLoading data-testid="route-loading" className="custom-loading" />
      </NextIntlClientProvider>,
    );

    const status = screen.getByRole("status");
    expect(status.textContent).toBe(en.App.loading);
    expect(status.className).toContain("custom-loading");
    expect(status.getAttribute("data-testid")).toBe("route-loading");
  });

  it("allows custom label override", () => {
    render(
      <NextIntlClientProvider locale="en" messages={en}>
        <RouteLoading label="Please wait..." />
      </NextIntlClientProvider>,
    );

    const status = screen.getByRole("status");
    expect(status.textContent).toBe("Please wait...");
  });
});
