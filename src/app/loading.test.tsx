import { cleanup, render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, expect, it } from "vitest";
import en from "@/messages/en.json";
import es from "@/messages/es.json";
import pt from "@/messages/pt-BR.json";
import ProtectedLoading from "./(protected)/loading";
import PublicLoading from "./(public)/loading";
import Loading from "./loading";

afterEach(cleanup);

it.each([
  ["en", en],
  ["pt-BR", pt],
  ["es", es],
] as const)("announces route loading once in %s", (locale, messages) => {
  render(
    <NextIntlClientProvider locale={locale} messages={messages}>
      <Loading />
    </NextIntlClientProvider>,
  );
  const status = screen.getByRole("status");
  expect(status.textContent).toBe(messages.App.loading);
  expect(status.getAttribute("aria-live")).toBe("polite");
  expect(status.querySelector("svg")?.getAttribute("aria-hidden")).toBe("true");
});

it.each([
  ["root-route", Loading],
  ["public-layout", PublicLoading],
  ["protected-layout", ProtectedLoading],
] as const)("marks the %s loading boundary", (boundary, Component) => {
  render(
    <NextIntlClientProvider locale="en" messages={en}>
      <Component />
    </NextIntlClientProvider>,
  );
  expect(
    screen
      .getByRole("status")
      .closest('[data-slot="loading-state"]')
      ?.getAttribute("data-loading-boundary"),
  ).toBe(boundary);
});
