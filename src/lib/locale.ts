import { enUs, esEs, ptBr } from "@firebase-oss/ui-translations";
import { locales } from "./locale-config.mjs";

export { defaultLocale, locales } from "./locale-config.mjs";

export type Locale = (typeof locales)[number];

export function isLocale(value: unknown): value is Locale {
  return (
    typeof value === "string" && (locales as readonly string[]).includes(value)
  );
}

export function parseLocale(locale: string) {
  if (locale === "pt-BR") return ptBr;
  if (locale === "es") return esEs;
  return enUs;
}
