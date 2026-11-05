import {
  initializeUI,
  providerPopupStrategy,
  providerRedirectStrategy,
} from "@firebase-oss/ui-core";
import type { FirebaseOptions } from "firebase/app";
import { getApp, getApps, initializeApp } from "firebase/app";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";
import {
  connectAuthEmulator,
  getAuth,
  onAuthStateChanged,
  type Unsubscribe,
  type User,
} from "firebase/auth";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";
import { connectFunctionsEmulator, getFunctions } from "firebase/functions";
import { connectStorageEmulator, getStorage } from "firebase/storage";
import { getPendingSignOut } from "@/lib/pending-sign-out";
import { getFirebaseConfig } from "./config";

function getEmulatorUrl(): string | undefined {
  const host = process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST?.trim();

  if (!host) return undefined;

  const url = host.includes("://") ? host : `http://${host}`;
  const parsed = new URL(url);
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error(
      "The Auth emulator host must use http:// or https://. See .env.example.",
    );
  }

  if (isElectronBrowser() && typeof window !== "undefined") {
    return window.location.origin;
  }

  return url.replace(/\/$/, "");
}

function isElectronBrowser() {
  return (
    typeof navigator !== "undefined" &&
    navigator.userAgent.includes("Electron/")
  );
}

function getValidatedFirebaseConfig(): FirebaseOptions {
  const config = getFirebaseConfig();
  const missing = Object.entries(config)
    .filter(([, value]) => typeof value !== "string" || !value.trim())
    .map(([key]) => key);
  if (missing.length) {
    throw new Error(
      `Missing Firebase configuration: ${missing.join(", ")}. See .env.example.`,
    );
  }

  return config;
}

function getOAuthProviderStrategy() {
  return isElectronBrowser()
    ? providerRedirectStrategy()
    : providerPopupStrategy();
}

function connectFirebaseAuthEmulator(auth: ReturnType<typeof getAuth>) {
  const emulatorUrl = getEmulatorUrl();
  if (!emulatorUrl) return;

  if (process.env.NODE_ENV !== "development") {
    throw new Error(
      "The Auth emulator requires development mode. See .env.example.",
    );
  }

  if (!globalThis.firebaseAuthEmulatorConnected) {
    connectAuthEmulator(auth, emulatorUrl);
    globalThis.firebaseAuthEmulatorConnected = true;
  }
}

function getFirebaseAuthForApp(app: ReturnType<typeof getFirebaseApp>) {
  const auth = getAuth(app);
  connectFirebaseAuthEmulator(auth);
  return auth;
}

export function getFirebaseUI() {
  const app = getFirebaseApp(getValidatedFirebaseConfig());
  const auth = getFirebaseAuthForApp(app);
  globalThis.firebaseUIStore ??= initializeUI({
    app,
    auth,
    behaviors: [getOAuthProviderStrategy()],
  });
  return globalThis.firebaseUIStore;
}

export function getFirebaseApp(config = getFirebaseConfig()) {
  return getApps().some((item) => item.name === "[DEFAULT]")
    ? getApp()
    : initializeApp(config);
}

function getEmulatorEndpoint(host: string, defaultPort: number) {
  const url = new URL(host.includes("://") ? host : `http://${host}`);
  return {
    host: url.hostname,
    port: Number(url.port || defaultPort),
  };
}

function connectFirestoreIfNeeded(firestore: ReturnType<typeof getFirestore>) {
  if (process.env.NODE_ENV !== "development") return;

  const host = process.env.NEXT_PUBLIC_FIRESTORE_EMULATOR_HOST?.trim();
  if (!host || globalThis.firebaseFirestoreEmulatorConnected) return;

  const endpoint = getEmulatorEndpoint(host, 8080);
  connectFirestoreEmulator(firestore, endpoint.host, endpoint.port);
  globalThis.firebaseFirestoreEmulatorConnected = true;
}

export function getFirebaseFirestore() {
  const firestore = getFirestore(getFirebaseApp(getValidatedFirebaseConfig()));
  connectFirestoreIfNeeded(firestore);
  return firestore;
}

let appCheckStarted = false;

/**
 * Starts App Check when a reCAPTCHA site key is configured, so callables can
 * enforce it (ADR 0026). Without the key it does nothing. The debug token flag
 * lets local development and emulators get a token without reCAPTCHA.
 */
function startAppCheck(app: ReturnType<typeof getFirebaseApp>) {
  const siteKey = process.env.NEXT_PUBLIC_FIREBASE_APPCHECK_SITE_KEY?.trim();
  if (appCheckStarted || !siteKey) return;
  appCheckStarted = true;

  if (process.env.NODE_ENV === "development") {
    // biome-ignore lint/suspicious/noExplicitAny: Firebase reads this global flag.
    (globalThis as any).FIREBASE_APPCHECK_DEBUG_TOKEN = true;
  }
  initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider(siteKey),
    isTokenAutoRefreshEnabled: true,
  });
}

export function getFirebaseFunctions() {
  const app = getFirebaseApp(getValidatedFirebaseConfig());
  startAppCheck(app);
  const functions = getFunctions(app);
  if (process.env.NODE_ENV !== "development") return functions;

  const host = (
    process.env.NEXT_PUBLIC_FIREBASE_FUNCTIONS_EMULATOR_HOST ||
    process.env.FUNCTIONS_EMULATOR_HOST
  )?.trim();

  if (!globalThis.firebaseFunctionsEmulatorConnected && host) {
    const endpoint = getEmulatorEndpoint(host, 5001);
    connectFunctionsEmulator(functions, endpoint.host, endpoint.port);
    globalThis.firebaseFunctionsEmulatorConnected = true;
  }

  return functions;
}

export function getFirebaseStorage() {
  const storage = getStorage(getFirebaseApp(getValidatedFirebaseConfig()));
  if (process.env.NODE_ENV !== "development") return storage;

  const host = (
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_EMULATOR_HOST ||
    process.env.FIREBASE_STORAGE_EMULATOR_HOST
  )?.trim();

  if (!globalThis.firebaseStorageEmulatorConnected && host) {
    const endpoint = getEmulatorEndpoint(host, 9199);
    connectStorageEmulator(storage, endpoint.host, endpoint.port);
    globalThis.firebaseStorageEmulatorConnected = true;
  }

  return storage;
}

/**
 * Observe the Firebase Auth state of the browser SDK. Throws if Firebase is
 * misconfigured. The SDK marks the observer's error and completed callbacks as
 * deprecated and never calls them, so failures surface only through the thrown
 * error.
 *
 * Sign-out is held back until it has persisted, so a rapid navigation cannot
 * restore stale auth. A newer event supersedes a held one.
 */
export function subscribeToAuth(
  onChange: (user: User | null) => void,
): Unsubscribe {
  let revision = 0;
  let active = true;
  const unsubscribe = onAuthStateChanged(getFirebaseUI().get().auth, (user) => {
    const current = ++revision;
    const pending = user ? null : getPendingSignOut();
    if (!pending) return onChange(user);

    const finish = () => {
      if (active && revision === current) onChange(user);
    };
    void pending.then(finish, finish);
  });
  return () => {
    active = false;
    unsubscribe();
  };
}

/** Return the Firebase Auth user of the browser SDK, or null when signed out. */
export function getFirebaseAuthUser(): User | null {
  return getFirebaseUI().get().auth.currentUser;
}

/** Return the active Firebase Auth user, requiring it to match the expected uid. */
export function getActiveFirebaseAuthUser(expectedUser: User): User {
  const currentUser = getFirebaseAuthUser();
  if (!currentUser || currentUser.uid !== expectedUser.uid) {
    throw new Error("Authentication session unavailable");
  }
  return currentUser;
}
