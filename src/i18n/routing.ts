import { defineRouting } from "next-intl/routing";
import { defaultLocale, isLocale, locales } from "@/lib/locale";

export const routing = defineRouting({
  locales,
  defaultLocale,
});

export { localeCookie } from "@/lib/locale-config.mjs";
export { defaultLocale, isLocale, locales };
