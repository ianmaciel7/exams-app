import { isLocale } from "@/lib/locale";
import { isThemePreference } from "@/lib/theme";
import {
  type ProfileFormValues,
  type ProfileValues,
  profileFieldNames,
} from "./definitions";

function readText(formData: FormData, name: string, fallback: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value : fallback;
}

/**
 * Reads the profile form's `FormData`. A missing or unknown value falls back to
 * `fallback`; a file input with no selection (empty `File`) means no new
 * avatar. The e-mail is read-only here and always comes from `fallback`.
 */
export function parseProfileFormData(
  formData: FormData,
  fallback: ProfileValues,
): ProfileFormValues {
  const locale = readText(formData, profileFieldNames.locale, fallback.locale);
  const theme = readText(formData, profileFieldNames.theme, fallback.theme);
  const avatar = formData.get(profileFieldNames.avatar);

  return {
    displayName: readText(
      formData,
      profileFieldNames.displayName,
      fallback.displayName,
    ).slice(0, 100),
    email: fallback.email,
    locale: isLocale(locale) ? locale : fallback.locale,
    theme: isThemePreference(theme) ? theme : fallback.theme,
    avatarFile: avatar instanceof File && avatar.size > 0 ? avatar : null,
  };
}
