import "server-only";

import { applicationDefault, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

/**
 * Privileged Firebase Auth for server-side verification. Production needs
 * Application Default Credentials; the Auth emulator
 * (`FIREBASE_AUTH_EMULATOR_HOST`) needs none.
 */
export function getAdminAuth() {
  const app =
    getApps()[0] ??
    initializeApp({
      credential: applicationDefault(),
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });
  return getAuth(app);
}
