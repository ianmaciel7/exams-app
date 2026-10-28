import { defineRouting } from "next-intl/routing";
import { defaultLocale, isLocale, locales } from "@/lib/locale";

export const routing = defineRouting({
  locales,
  defaultLocale,
});

export { defaultLocale, isLocale, locales };

export const localeCookie = "NEXT_LOCALE";
