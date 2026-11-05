import "server-only";

import { applicationDefault, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

/**
 * One privileged app for the server. Production needs Application Default
 * Credentials; the Auth, Firestore and Storage emulators
 * (`FIREBASE_AUTH_EMULATOR_HOST`, `FIRESTORE_EMULATOR_HOST`,
 * `FIREBASE_STORAGE_EMULATOR_HOST`) need none.
 */
function getAdminApp() {
  return (
    getApps()[0] ??
    initializeApp({
      credential: applicationDefault(),
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    })
  );
}

/** Privileged Firebase Auth for server-side verification and profile writes. */
export function getAdminAuth() {
  return getAuth(getAdminApp());
}

/** Privileged Firestore; it bypasses security rules, so callers check ownership. */
export function getAdminFirestore() {
  return getFirestore(getAdminApp());
}

/** Privileged default Storage bucket; it bypasses security rules too. */
export function getAdminBucket() {
  return getStorage(getAdminApp()).bucket();
}
