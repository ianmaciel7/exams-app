import type { ComponentProps } from "react";
import { expect, expectTypeOf, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("next-intl/server", () => ({
  getLocale: async () => "pt-BR",
  getMessages: async () => ({ title: "Olá" }),
}));

import { IntlProviderServer } from "./intl-provider-server";

it("owns locale and messages even if an untyped caller tries to override them", async () => {
  const result = await Reflect.apply(IntlProviderServer, undefined, [
    {
      locale: "es",
      messages: { title: "Hola" },
      timeZone: "UTC",
      children: "content",
    },
  ]);
  expect(result.props).toMatchObject({
    locale: "pt-BR",
    messages: { title: "Olá" },
    timeZone: "UTC",
    children: "content",
  });
});

it("does not expose request-owned props in its public type", () => {
  type Props = ComponentProps<typeof IntlProviderServer>;
  expectTypeOf<
    "locale" extends keyof Props ? true : false
  >().toEqualTypeOf<false>();
  expectTypeOf<
    "messages" extends keyof Props ? true : false
  >().toEqualTypeOf<false>();
});
