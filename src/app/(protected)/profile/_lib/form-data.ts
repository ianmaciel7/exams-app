import { isLocale } from "@/lib/locale";
import { isThemePreference } from "@/lib/theme";
import type { ProfileFormValues, ProfileValues } from "./definitions";

/** Field names shared by the form controls and the Action. */
export const profileFieldNames = {
  avatar: "avatar",
  displayName: "displayName",
  email: "email",
  locale: "locale",
  theme: "theme",
} as const;

function readText(formData: FormData, name: string, fallback: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value : fallback;
}

/**
 * Reads the profile form's `FormData`. A missing or unknown value falls back to
 * `fallback`; a file input with no selection (empty `File`) falls back to
 * `pendingAvatar`, the upload kept from a failed save.
 */
export function parseProfileFormData(
  formData: FormData,
  fallback: ProfileValues,
  pendingAvatar: File | null,
): ProfileFormValues {
  const locale = readText(formData, profileFieldNames.locale, fallback.locale);
  const theme = readText(formData, profileFieldNames.theme, fallback.theme);
  const avatar = formData.get(profileFieldNames.avatar);

  return {
    displayName: readText(
      formData,
      profileFieldNames.displayName,
      fallback.displayName,
    ),
    email: readText(formData, profileFieldNames.email, fallback.email),
    locale: isLocale(locale) ? locale : fallback.locale,
    theme: isThemePreference(theme) ? theme : fallback.theme,
    avatarFile:
      avatar instanceof File && avatar.size > 0 ? avatar : pendingAvatar,
  };
}
