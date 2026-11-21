import {
  type Auth,
  useDeviceLanguage as applyDeviceLanguage,
} from "firebase/auth";

export const SUPPORTED_LOCALES = ["en", "pt-BR", "es"] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: SupportedLocale = "en";
export const LOCALE_COOKIE_NAME = "NEXT_LOCALE";

export function isValidLocale(locale: unknown): locale is SupportedLocale {
  return (
    typeof locale === "string" &&
    (SUPPORTED_LOCALES as readonly string[]).includes(locale)
  );
}

export function getClientCookieLocale(): SupportedLocale | null {
  if (typeof document === "undefined") {
    return null;
  }
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${LOCALE_COOKIE_NAME}=([^;]*)`)
  );
  const value = match ? decodeURIComponent(match[1]) : null;
  return isValidLocale(value) ? value : null;
}

export function setClientCookieLocale(locale: SupportedLocale): void {
  if (typeof document === "undefined") {
    return;
  }
  const maxAge = 60 * 60 * 24 * 365; // 1 year
  document.cookie = `${LOCALE_COOKIE_NAME}=${encodeURIComponent(
    locale
  )}; path=/; max-age=${maxAge}; SameSite=Lax`;
  try {
    localStorage.setItem(LOCALE_COOKIE_NAME, locale);
  } catch (_e) {
    // Ignore quota/private mode errors
  }
}

export function syncFirebaseLocale(
  authInstance: Auth,
  locale: SupportedLocale
): void {
  authInstance.languageCode = locale;
  setClientCookieLocale(locale);
}

export function initGuestFirebaseLocale(authInstance: Auth): void {
  const existingCookieLocale = getClientCookieLocale();
  if (existingCookieLocale) {
    authInstance.languageCode = existingCookieLocale;
  } else {
    applyDeviceLanguage(authInstance);
  }
}
