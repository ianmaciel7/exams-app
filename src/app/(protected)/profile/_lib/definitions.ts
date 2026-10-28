import type { Locale } from "@/lib/locale";
import type { ThemePreference } from "@/lib/theme";

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
