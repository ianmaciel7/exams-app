import "server-only";
import { getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

// Demo projects cannot accidentally write to a live Firebase project.
if (process.env.NODE_ENV === "development") {
  process.env.FIREBASE_AUTH_EMULATOR_HOST ??= "127.0.0.1:9099";
  process.env.FIRESTORE_EMULATOR_HOST ??= "127.0.0.1:8080";
}
export function firebase() {
  const projectId = process.env.FIREBASE_PROJECT_ID ?? "demo-recall";
  if (projectId.startsWith("demo-") && !process.env.FIREBASE_AUTH_EMULATOR_HOST)
    throw new Error(
      "Configure Firebase or start the app in development with the local emulators.",
    );
  const app = getApps()[0] ?? initializeApp({ projectId });
  return { auth: getAuth(app), db: getFirestore(app) };
}
