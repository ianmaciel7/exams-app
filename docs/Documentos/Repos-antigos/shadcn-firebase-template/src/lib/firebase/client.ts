import {
  initializeUI,
  providerPopupStrategy,
  providerRedirectStrategy,
} from "@firebase-oss/ui-core";
import type { FirebaseOptions } from "firebase/app";
import { getApp, getApps, initializeApp } from "firebase/app";
import { connectAuthEmulator, getAuth } from "firebase/auth";
import { connectDatabaseEmulator, getDatabase } from "firebase/database";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";
import { connectFunctionsEmulator, getFunctions } from "firebase/functions";
import { connectStorageEmulator, getStorage } from "firebase/storage";
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

  const emulatorUrl = url.replace(/\/$/, "");

  if (isElectronBrowser() && typeof window !== "undefined") {
    return window.location.origin;
  }

  return emulatorUrl;
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

export function getFirebaseAuth() {
  return getFirebaseAuthForApp(getFirebaseApp(getValidatedFirebaseConfig()));
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

export function getFirebaseDatabase() {
  const database = getDatabase(getFirebaseApp(getValidatedFirebaseConfig()));
  if (process.env.NODE_ENV !== "development") return database;

  const host = (
    process.env.NEXT_PUBLIC_FIREBASE_DATABASE_EMULATOR_HOST ||
    process.env.FIREBASE_DATABASE_EMULATOR_HOST
  )?.trim();

  if (!globalThis.firebaseDatabaseEmulatorConnected && host) {
    const url = new URL(host.includes("://") ? host : `http://${host}`);
    connectDatabaseEmulator(database, url.hostname, Number(url.port || 9000));
    globalThis.firebaseDatabaseEmulatorConnected = true;
  }

  return database;
}

export function getFirebaseFunctions() {
  const functions = getFunctions(getFirebaseApp(getValidatedFirebaseConfig()));
  if (process.env.NODE_ENV !== "development") return functions;

  const host = (
    process.env.NEXT_PUBLIC_FIREBASE_FUNCTIONS_EMULATOR_HOST ||
    process.env.FUNCTIONS_EMULATOR_HOST
  )?.trim();

  if (!globalThis.firebaseFunctionsEmulatorConnected && host) {
    const url = new URL(host.includes("://") ? host : `http://${host}`);
    connectFunctionsEmulator(functions, url.hostname, Number(url.port || 5001));
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
    const url = new URL(host.includes("://") ? host : `http://${host}`);
    connectStorageEmulator(storage, url.hostname, Number(url.port || 9199));
    globalThis.firebaseStorageEmulatorConnected = true;
  }

  return storage;
}

export function getFirebaseHosting() {
  const emulatorHost = (
    process.env.NEXT_PUBLIC_FIREBASE_HOSTING_EMULATOR_HOST ||
    process.env.FIREBASE_HOSTING_EMULATOR_HOST
  )?.trim();

  const url = emulatorHost
    ? emulatorHost.includes("://")
      ? emulatorHost
      : `http://${emulatorHost}`
    : `https://${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "localhost"}.web.app`;

  return { url };
}

export function getFirebasePubSub() {
  const functions = getFirebaseFunctions();
  return {
    async publish(
      topic: string,
      data: unknown,
      attributes?: Record<string, string>,
    ) {
      const { httpsCallable } = await import("firebase/functions");
      const publishFn = httpsCallable<
        { topic: string; data: unknown; attributes?: Record<string, string> },
        { success: boolean; messageId: string }
      >(functions, "publishPubSubMessage");
      const response = await publishFn({ topic, data, attributes });
      return response.data;
    },
  };
}

export function getFirebaseExtensions() {
  const host = (
    process.env.NEXT_PUBLIC_FIREBASE_EXTENSIONS_EMULATOR_HOST ||
    process.env.FIREBASE_EXTENSIONS_EMULATOR_HOST
  )?.trim();

  return {
    emulatorUrl: host
      ? host.includes("://")
        ? host
        : `http://${host}`
      : undefined,
  };
}
