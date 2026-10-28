import { describe, expect, it } from "vitest";
import { routing } from "@/i18n/routing";
import en from "./en.json";
import es from "./es.json";
import ptBR from "./pt-BR.json";

type Catalog = { [key: string]: string | Catalog };

const catalogs: Record<(typeof routing.locales)[number], Catalog> = {
  en,
  "pt-BR": ptBR,
  es,
};

function flatten(
  catalog: Catalog,
  prefix = "",
  flat: Record<string, string> = {},
): Record<string, string> {
  for (const [key, value] of Object.entries(catalog)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "string") {
      flat[path] = value;
    } else {
      flatten(value, path, flat);
    }
  }
  return flat;
}

// ICU arguments such as {name} must survive translation unchanged.
const placeholders = (message: string) =>
  [...message.matchAll(/\{(\w+)/g)].map((match) => match[1]).sort();

const reference = flatten(catalogs[routing.defaultLocale]);

describe("message catalogs", () => {
  it("has a catalog for every supported locale", () => {
    expect(Object.keys(catalogs).sort()).toEqual([...routing.locales].sort());
  });

  describe.each(routing.locales)("%s", (locale) => {
    const messages = flatten(catalogs[locale]);

    it("defines exactly the keys of the default locale", () => {
      expect(Object.keys(messages).sort()).toEqual(
        Object.keys(reference).sort(),
      );
    });

    it("has no empty messages", () => {
      const empty = Object.entries(messages)
        .filter(([, value]) => value.trim() === "")
        .map(([key]) => key);
      expect(empty).toEqual([]);
    });

    it("keeps the same ICU arguments as the default locale", () => {
      const mismatched = Object.keys(reference).filter(
        (key) =>
          JSON.stringify(placeholders(messages[key] ?? "")) !==
          JSON.stringify(placeholders(reference[key])),
      );
      expect(mismatched).toEqual([]);
    });
  });
});
