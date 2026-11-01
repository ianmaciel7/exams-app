import { localeCookie } from "@/i18n/routing";
import type { Locale } from "@/lib/locale";

export function syncSavedLocale(
  savedLocale: Locale,
  activeLocale: string,
  refresh: () => void,
) {
  if (savedLocale === activeLocale) return false;
  // biome-ignore lint/suspicious/noDocumentCookie: Synchronize the persisted preference with cookie-only locale routing.
  document.cookie = `${localeCookie}=${savedLocale}; Path=/; Max-Age=31536000; SameSite=Lax`;
  refresh();
  return true;
}
