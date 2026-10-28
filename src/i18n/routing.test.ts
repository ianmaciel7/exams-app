import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { isLocale, localeCookie, routing } from "./routing";

describe("routing", () => {
  it("supports English, Brazilian Portuguese, and Spanish, defaulting to English", () => {
    expect(routing.locales).toEqual(["en", "pt-BR", "es"]);
    expect(routing.defaultLocale).toBe("en");
  });

  it("defaults to a locale that is supported", () => {
    expect(routing.locales).toContain(routing.defaultLocale);
  });

  it("stores the selected locale in the NEXT_LOCALE cookie", () => {
    expect(localeCookie).toBe("NEXT_LOCALE");
  });
});

describe("isLocale", () => {
  it.each(routing.locales)("accepts the supported locale %s", (locale) => {
    expect(isLocale(locale)).toBe(true);
  });

  it("rejects every string that is not a supported locale", () => {
    fc.assert(
      fc.property(
        fc
          .string()
          .filter((value) => !routing.locales.some((l) => l === value)),
        (value) => {
          expect(isLocale(value)).toBe(false);
        },
      ),
    );
  });

  it("rejects every value that is not a string", () => {
    fc.assert(
      fc.property(
        fc.anything().filter((value) => typeof value !== "string"),
        (value) => {
          expect(isLocale(value)).toBe(false);
        },
      ),
    );
  });

  it("matches locale codes exactly, including case", () => {
    expect(isLocale("PT-BR")).toBe(false);
    expect(isLocale("pt-br")).toBe(false);
    expect(isLocale("en-US")).toBe(false);
  });
});
