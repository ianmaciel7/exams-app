import { beforeEach, describe, expect, it, vi } from "vitest";

const { readCookie, readHeader } = vi.hoisted(() => ({
  readCookie: vi.fn(),
  readHeader: vi.fn(),
}));
vi.mock("next/headers", () => ({
  cookies: async () => ({ get: readCookie }),
  headers: async () => ({ get: readHeader }),
}));
vi.mock("next-intl/server", () => ({
  getRequestConfig: (factory: unknown) => factory,
}));

import requestConfig from "./request";
import { localeCookie } from "./routing";

describe("locale resolution", () => {
  beforeEach(() => {
    readCookie.mockReset();
    readHeader.mockReset();
  });

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
    "defaults invalid or missing cookies to English without a browser preference: %j",
    async (cookie) => {
      readCookie.mockReturnValue(cookie);
      const result = await Reflect.apply(requestConfig, undefined, [{}]);
      expect(result.locale).toBe("en");
      expect(result.messages).toEqual(
        (await import("../messages/en.json")).default,
      );
    },
  );

  it.each([
    ["pt-BR,pt;q=0.9,en;q=0.8", "pt-BR"],
    ["es-MX,es;q=0.9,en;q=0.8", "es"],
  ])("uses the preferred browser locale %s", async (acceptLanguage, locale) => {
    readHeader.mockReturnValue(acceptLanguage);

    const result = await Reflect.apply(requestConfig, undefined, [{}]);

    expect(readHeader).toHaveBeenCalledWith("accept-language");
    expect(result.locale).toBe(locale);
  });

  it("prefers the saved cookie locale over the browser preference", async () => {
    readCookie.mockReturnValue({ value: "es" });
    readHeader.mockReturnValue("pt-BR,pt;q=0.9");

    const result = await Reflect.apply(requestConfig, undefined, [{}]);

    expect(result.locale).toBe("es");
  });

  it("preserves an explicit server translation locale override", async () => {
    readCookie.mockReturnValue({ value: "pt-BR" });
    const result = await Reflect.apply(requestConfig, undefined, [
      { locale: "es" },
    ]);
    expect(result.locale).toBe("es");
  });
});
