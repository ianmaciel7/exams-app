import { cleanup, render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, describe, expect, it } from "vitest";
import en from "@/messages/en.json";
import { LoadingPrimitive } from "./loading-primitive";

describe("LoadingPrimitive", () => {
  afterEach(cleanup);

  it("renders loading indicator with default localized label and forwards props", () => {
    render(
      <NextIntlClientProvider locale="en" messages={en}>
        <LoadingPrimitive
          data-testid="loading-primitive"
          className="custom-loading"
        />
      </NextIntlClientProvider>,
    );

    const status = screen.getByRole("status");
    expect(status.textContent).toBe(en.App.loading);
    expect(status.className).toContain("custom-loading");
    expect(status.getAttribute("data-testid")).toBe("loading-primitive");
    const overlay = status.closest('[data-slot="loading-overlay"]');
    expect(overlay?.className).toContain("fixed");
    expect(overlay?.className).toContain("inset-0");
    expect(status.parentElement?.className).toContain("h-svh");
    expect(status.parentElement?.className).toContain("top-0");
  });

  it("allows custom label override via children", () => {
    const customLabel = "Please wait...";
    render(
      <NextIntlClientProvider locale="en" messages={en}>
        <LoadingPrimitive>{customLabel}</LoadingPrimitive>
      </NextIntlClientProvider>,
    );

    const status = screen.getByRole("status");
    expect(status.textContent).toBe(customLabel);
  });
});
