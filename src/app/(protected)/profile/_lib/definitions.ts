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

export type ProfileLoadState =
  | { isLoading: true; isError: false }
  | {
      isLoading: false;
      isError: false;
      values: ProfileValues;
      theme?: ThemePreference;
    }
  | { isLoading: false; isError: true; error: unknown };

/**
 * Result of the profile form Action (`useActionState`). `values` is what the
 * fields show next: the saved values, or the submitted ones after a failure so
 * React's post-Action form reset does not discard the user's input.
 * `avatarFile` is the pending upload kept across a failed save.
 */
export type ProfileActionState = {
  /** Last values persisted; the base `saveProfile` diffs the submission against. */
  saved: ProfileValues;
  values: ProfileValues;
  avatarFile: File | null;
  error: string | null;
  /** Number of saved submissions; busts the cached avatar image. */
  savedCount: number;
};

export type SavedProfile = {
  values: ProfileValues;
  photoURL: string | null;
  avatarChanged: boolean;
  emailChanged: boolean;
};

export type SaveProfileInput = {
  user: import("firebase/auth").User;
  previous: ProfileValues;
  values: ProfileValues;
  avatarFile: File | null;
};

/** Ports for profile persistence. Tests may inject adapters without Firebase. */
export type ProfileDependencies = {
  getActiveUser: typeof import("@/lib/session").getActiveUser;
  verifyBeforeUpdateEmail: typeof import("firebase/auth").verifyBeforeUpdateEmail;
  updateProfile: typeof import("firebase/auth").updateProfile;
  uploadAvatar: (
    user: import("firebase/auth").User,
    avatarFile: File | null,
  ) => Promise<string | null>;
  writeUserPreferences: (
    uid: string,
    preferences: Partial<UserPreferences>,
  ) => Promise<void>;
};
