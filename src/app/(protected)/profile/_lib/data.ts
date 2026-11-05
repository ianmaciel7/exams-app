import "server-only";

import { getLocale } from "next-intl/server";
import { defaultLocale, isLocale } from "@/i18n/routing";
import {
  getAdminAuth,
  getAdminBucket,
  getAdminFirestore,
} from "@/lib/firebase/admin";
import type { Locale } from "@/lib/locale";
import { isThemePreference } from "@/lib/theme";
import { verifySession } from "../../_lib/dal";
import type {
  ProfileSnapshot,
  ProfileValues,
  UserPreferences,
} from "./definitions";

const usersCollection = "users";

/** Preferences stored for the user; unsupported stored values are dropped. */
export async function readUserPreferences(
  uid: string,
): Promise<Partial<UserPreferences>> {
  const snapshot = await getAdminFirestore()
    .collection(usersCollection)
    .doc(uid)
    .get();
  const data = snapshot.data();

  return {
    ...(isLocale(data?.locale) ? { locale: data.locale } : {}),
    ...(isThemePreference(data?.theme) ? { theme: data.theme } : {}),
  };
}

async function writeUserPreferences(
  uid: string,
  preferences: Partial<UserPreferences>,
): Promise<void> {
  await getAdminFirestore()
    .collection(usersCollection)
    .doc(uid)
    .set(preferences, { merge: true });
}

/** Read a user's profile; `activeLocale` fills a missing stored locale. */
export async function readProfile(
  uid: string,
  activeLocale: Locale,
): Promise<ProfileSnapshot> {
  const [user, preferences] = await Promise.all([
    getAdminAuth().getUser(uid),
    readUserPreferences(uid),
  ]);
  return {
    photoURL: user.photoURL ?? null,
    values: {
      displayName: user.displayName ?? "",
      email: user.email ?? "",
      locale: preferences.locale ?? activeLocale,
      theme: preferences.theme ?? "system",
    },
  };
}

/**
 * Read the signed-in user's profile for the route. The session is verified here
 * (Data Access Layer), and a missing stored locale falls back to the active one.
 */
export async function readOwnProfile(): Promise<ProfileSnapshot> {
  const { userId } = await verifySession();
  if (!userId) throw new Error("Authentication session unavailable");
  const activeLocale = await getLocale();
  return readProfile(
    userId,
    isLocale(activeLocale) ? activeLocale : defaultLocale,
  );
}

/** Upload the avatar and return a Firebase Storage download URL for it. */
async function uploadAvatar(uid: string, avatarFile: File) {
  const file = getAdminBucket().file(`users/${uid}/avatar`);
  const token = crypto.randomUUID();
  await file.save(Buffer.from(await avatarFile.arrayBuffer()), {
    contentType: avatarFile.type,
    metadata: { metadata: { firebaseStorageDownloadTokens: token } },
  });
  const host = process.env.FIREBASE_STORAGE_EMULATOR_HOST
    ? `http://${process.env.FIREBASE_STORAGE_EMULATOR_HOST}`
    : "https://firebasestorage.googleapis.com";
  const path = encodeURIComponent(file.name);
  return `${host}/v0/b/${file.bucket.name}/o/${path}?alt=media&token=${token}`;
}

type SaveProfileInput = {
  uid: string;
  previous: ProfileSnapshot;
  values: ProfileValues;
  avatarFile: File | null;
};

/**
 * Persist the changed fields. The e-mail is never written here: changing it
 * needs the browser SDK, which sends the confirmation mail.
 */
export async function saveProfile({
  uid,
  previous,
  values,
  avatarFile,
}: SaveProfileInput): Promise<ProfileSnapshot> {
  const displayName = values.displayName.trim();
  const photoURL = avatarFile
    ? await uploadAvatar(uid, avatarFile)
    : previous.photoURL;

  if (displayName !== previous.values.displayName || avatarFile) {
    await getAdminAuth().updateUser(uid, {
      displayName: displayName || null,
      photoURL,
    });
  }
  if (
    values.locale !== previous.values.locale ||
    values.theme !== previous.values.theme
  ) {
    await writeUserPreferences(uid, {
      locale: values.locale,
      theme: values.theme,
    });
  }
  return {
    photoURL,
    values: { ...values, email: previous.values.email, displayName },
  };
}
