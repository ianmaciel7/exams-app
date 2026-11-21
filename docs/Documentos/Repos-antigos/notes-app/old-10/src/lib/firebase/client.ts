import { getApps, initializeApp } from "firebase/app";
import { connectAuthEmulator, getAuth } from "firebase/auth";

export function browserAuth() {
  const app =
    getApps()[0] ??
    initializeApp({
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "demo-api-key",
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "demo-recall",
      authDomain:
        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ??
        "demo-recall.firebaseapp.com",
    });
  const auth = getAuth(app);
  if (process.env.NODE_ENV === "development" && !auth.emulatorConfig)
    connectAuthEmulator(auth, "http://127.0.0.1:9099", {
      disableWarnings: true,
    });
  return auth;
}
