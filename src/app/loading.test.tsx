import { cleanup, render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, expect, it } from "vitest";
import Loading from "./loading";

afterEach(cleanup);

it("renders the loading screen", () => {
  render(
    <NextIntlClientProvider
      locale="en"
      messages={{ App: { loading: "Loading…" } }}
    >
      <Loading />
    </NextIntlClientProvider>,
  );
  expect(screen.getByRole("status").textContent).toBe("Loading…");
});
