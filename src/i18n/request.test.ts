import { beforeEach, describe, expect, it, vi } from "vitest";

const { readCookie } = vi.hoisted(() => ({ readCookie: vi.fn() }));
vi.mock("next/headers", () => ({
  cookies: async () => ({ get: readCookie }),
}));
vi.mock("next-intl/server", () => ({
  getRequestConfig: (factory: unknown) => factory,
}));

import requestConfig from "./request";
import { localeCookie } from "./routing";

describe("cookie-only locale resolution", () => {
  beforeEach(() => readCookie.mockReset());

  it.each(["en", "pt-BR", "es"])(
    "loads the %s cookie catalog without route parameters",
    async (locale) => {
      readCookie.mockReturnValue({ value: locale });
      const result = await Reflect.apply(requestConfig, undefined, [{}]);
      expect(readCookie).toHaveBeenCalledWith(localeCookie);
      expect(result.locale).toBe(locale);
      expect(result.messages).toEqual(
        (await import(`../messages/${locale}.json`)).default,
      );
    },
  );

  it.each([undefined, { value: "unsupported" }, { value: "../es" }])(
    "defaults invalid or missing cookies to English: %j",
    async (cookie) => {
      readCookie.mockReturnValue(cookie);
      const result = await Reflect.apply(requestConfig, undefined, [{}]);
      expect(result.locale).toBe("en");
      expect(result.messages).toEqual(
        (await import("../messages/en.json")).default,
      );
    },
  );

  it("preserves an explicit server translation locale override", async () => {
    readCookie.mockReturnValue({ value: "pt-BR" });
    const result = await Reflect.apply(requestConfig, undefined, [
      { locale: "es" },
    ]);
    expect(result.locale).toBe("es");
  });
});
