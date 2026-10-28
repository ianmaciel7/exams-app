import {
  type User,
  updateProfile,
  verifyBeforeUpdateEmail,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import {
  getFirebaseFirestore,
  getFirebaseStorage,
} from "@/lib/firebase/client";
import { isLocale, type Locale } from "@/lib/locale";
import { getActiveUser, getSessionUser } from "@/lib/session";
import { isThemePreference } from "@/lib/theme";
import type {
  ProfileDependencies,
  ProfileValues,
  SavedProfile,
  SaveProfileInput,
  UserPreferences,
} from "./definitions";

export type { ProfileDependencies } from "./definitions";

export async function readUserPreferences(
  uid: string,
): Promise<Partial<UserPreferences>> {
  const snapshot = await getDoc(doc(getFirebaseFirestore(), "users", uid));
  const data = snapshot.data();

  return {
    ...(isLocale(data?.locale) ? { locale: data.locale } : {}),
    ...(isThemePreference(data?.theme) ? { theme: data.theme } : {}),
  };
}

export async function writeUserPreferences(
  uid: string,
  preferences: Partial<UserPreferences>,
): Promise<void> {
  await setDoc(doc(getFirebaseFirestore(), "users", uid), preferences, {
    merge: true,
  });
}

export async function readProfile(
  uid: string,
  activeLocale: Locale,
  isActive: () => boolean,
) {
  const preferences = await readUserPreferences(uid);
  if (!isActive()) return null;
  const currentUser = getSessionUser();
  if (!currentUser || currentUser.uid !== uid) return null;
  const values: ProfileValues = {
    displayName: currentUser.displayName ?? "",
    email: currentUser.email ?? "",
    locale: preferences.locale ?? activeLocale,
    theme: preferences.theme ?? "system",
  };
  return { values, theme: preferences.theme };
}

async function uploadAvatar(user: User, avatarFile: File | null) {
  if (!avatarFile) return user.photoURL;

  const avatarRef = ref(getFirebaseStorage(), `users/${user.uid}/avatar`);
  await uploadBytes(avatarRef, avatarFile, { contentType: avatarFile.type });
  return getDownloadURL(avatarRef);
}

const defaultProfileDependencies: ProfileDependencies = {
  getActiveUser,
  verifyBeforeUpdateEmail,
  updateProfile,
  uploadAvatar,
  writeUserPreferences,
};

function getProfileChanges(
  user: User,
  previous: ProfileValues,
  values: ProfileValues,
) {
  const displayName = values.displayName.trim();
  const email = values.email.trim();
  return {
    displayName,
    email,
    emailChanged: email !== (user.email ?? ""),
    nameChanged: displayName !== (user.displayName ?? ""),
    preferencesChanged:
      values.locale !== previous.locale || values.theme !== previous.theme,
  };
}

function getProfileUpdate(
  displayName: string,
  nameChanged: boolean,
  photoURL: string | null,
  avatarChanged: boolean,
) {
  return {
    ...(nameChanged ? { displayName: displayName || null } : {}),
    ...(avatarChanged ? { photoURL } : {}),
  };
}

export async function saveProfile(
  { user, previous, values, avatarFile }: SaveProfileInput,
  dependencies: ProfileDependencies = defaultProfileDependencies,
): Promise<SavedProfile> {
  const authUser = dependencies.getActiveUser(user);
  const { displayName, email, emailChanged, nameChanged, preferencesChanged } =
    getProfileChanges(authUser, previous, values);

  if (emailChanged) await dependencies.verifyBeforeUpdateEmail(authUser, email);

  // Recheck after every asynchronous boundary before starting another write.
  dependencies.getActiveUser(user);
  const photoURL = await dependencies.uploadAvatar(authUser, avatarFile);
  const avatarChanged = Boolean(avatarFile);
  if (nameChanged || avatarChanged) {
    dependencies.getActiveUser(user);
    await dependencies.updateProfile(
      authUser,
      getProfileUpdate(displayName, nameChanged, photoURL, avatarChanged),
    );
  }
  if (preferencesChanged) {
    dependencies.getActiveUser(user);
    await dependencies.writeUserPreferences(authUser.uid, {
      locale: values.locale,
      theme: values.theme,
    });
  }

  dependencies.getActiveUser(user);
  return {
    photoURL,
    avatarChanged,
    emailChanged,
    values: {
      displayName,
      email: authUser.email ?? previous.email,
      locale: values.locale,
      theme: values.theme,
    },
  };
}
