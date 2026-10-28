import { cleanup, render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, expect, it } from "vitest";
import en from "@/messages/en.json";
import es from "@/messages/es.json";
import pt from "@/messages/pt-BR.json";
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
