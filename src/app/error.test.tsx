import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, expect, it, vi } from "vitest";
import en from "@/messages/en.json";
import ErrorPage from "./error";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

it("retries the failed read when the user asks to try again", () => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  const retry = vi.fn();
  render(
    <NextIntlClientProvider locale="en" messages={en}>
      <ErrorPage error={new Error("transient read failed")} retry={retry} />
    </NextIntlClientProvider>,
  );
  fireEvent.click(screen.getByRole("button", { name: en.App.tryAgain }));
  expect(retry).toHaveBeenCalledOnce();
});
