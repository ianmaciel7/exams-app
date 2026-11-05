// Shared by application modules and plain Node.js verification scripts.
export const locales = /** @type {const} */ (["en", "pt-BR", "es"]);
/** @type {(typeof locales)[number]} */
export const defaultLocale = "en";
export const localeCookie = "NEXT_LOCALE";
