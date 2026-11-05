import type { Locale } from "@/lib/locale";
import type { ThemePreference } from "@/lib/theme";

/** Field names are part of the profile form's data contract. */
export const profileFieldNames = {
  avatar: "avatar",
  displayName: "displayName",
  email: "email",
  locale: "locale",
  theme: "theme",
} as const;

export type UserPreferences = {
  locale: Locale;
  theme: ThemePreference;
};

export type ProfileValues = {
  displayName: string;
  email: string;
  locale: Locale;
  theme: ThemePreference;
};

export type ProfileFormValues = ProfileValues & { avatarFile: File | null };

/**
 * Result of the profile Server Action. Everything here is serializable.
 * `values` is what the fields show next: the saved values, or the submitted
 * ones after a failure so React's post-Action form reset does not discard the
 * user's input. `photoURL` is the stored avatar; `savedCount` busts its cache.
 */
export type ProfileActionState = {
  values: ProfileValues;
  photoURL: string | null;
  hasError: boolean;
  savedCount: number;
};

/**
 * The Action the page injects into `ProfileForm`. A Server Action in
 * production; tests pass a plain function.
 */
export type ProfileAction = (
  previous: ProfileActionState | null,
  formData: FormData,
) => Promise<ProfileActionState>;

/** What the Server Component page reads and hands to the form. */
export type ProfileSnapshot = {
  values: ProfileValues;
  photoURL: string | null;
};
