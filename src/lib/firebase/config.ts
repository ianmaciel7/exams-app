import type { FirebaseOptions } from "firebase/app";

/** Public Firebase Web configuration; it contains no service-account secret. */
export function getFirebaseConfig(): FirebaseOptions {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
  const databaseURL = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL;

  return {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    ...(projectId
      ? { storageBucket: storageBucket || `${projectId}.appspot.com` }
      : {}),
    ...(databaseURL ? { databaseURL } : {}),
  };
}
