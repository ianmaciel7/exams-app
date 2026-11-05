import { localeCookie } from "@/i18n/routing";
import type { Locale } from "@/lib/locale";

const MAX_AVATAR_SIZE = 2 * 1024 * 1024;
const ACCEPTED_AVATAR_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

function getAvatarSource(
  preview: string | null,
  photoURL: string | null,
  version: number,
) {
  if (preview) return preview;
  if (!photoURL || !version) return photoURL ?? undefined;

  return `${photoURL}${photoURL.includes("?") ? "&" : "?"}v=${version}`;
}

function isValidAvatarFile(file: Pick<File, "size" | "type">) {
  return ACCEPTED_AVATAR_TYPES.has(file.type) && file.size <= MAX_AVATAR_SIZE;
}

function getAvatarFallbackInitial(
  displayName: string | null,
  email: string | null,
) {
  return (displayName?.charAt(0) || email?.charAt(0) || "U").toUpperCase();
}

function syncSavedLocale(
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

export {
  ACCEPTED_AVATAR_TYPES,
  getAvatarFallbackInitial,
  getAvatarSource,
  isValidAvatarFile,
  MAX_AVATAR_SIZE,
  syncSavedLocale,
};
