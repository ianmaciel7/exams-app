import type { User } from "firebase/auth";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  app: { name: "[DEFAULT]" },
  apps: [] as { name: string }[],
  auth: {
    currentUser: null as { uid: string; reload?: () => Promise<void> } | null,
  },
  getPendingSignOut: vi.fn(),
  onAuthStateChanged: vi.fn(),
  store: { id: "firebase-ui" },
  getApp: vi.fn(),
  getApps: vi.fn(),
  getAuth: vi.fn(),
  getFunctions: vi.fn(),
  initializeApp: vi.fn(),
  initializeUI: vi.fn(),
  popupStrategy: { strategy: "popup" },
  redirectStrategy: { strategy: "redirect" },
  providerPopupStrategy: vi.fn(),
  providerRedirectStrategy: vi.fn(),
  connectAuthEmulator: vi.fn(),
  connectFirestoreEmulator: vi.fn(),
  connectFunctionsEmulator: vi.fn(),
  connectStorageEmulator: vi.fn(),
  getFirestore: vi.fn(),
  getStorage: vi.fn(),
  initializeAppCheck: vi.fn(),
  ReCaptchaV3Provider: vi.fn(),
}));

vi.mock("firebase/app", () => ({
  getApp: mocks.getApp,
  getApps: mocks.getApps,
  initializeApp: mocks.initializeApp,
}));
vi.mock("firebase/app-check", () => ({
  initializeAppCheck: mocks.initializeAppCheck,
  ReCaptchaV3Provider: mocks.ReCaptchaV3Provider,
}));
vi.mock("firebase/auth", () => ({
  connectAuthEmulator: mocks.connectAuthEmulator,
  getAuth: mocks.getAuth,
  onAuthStateChanged: mocks.onAuthStateChanged,
}));
vi.mock("@/lib/pending-sign-out", () => ({
  getPendingSignOut: mocks.getPendingSignOut,
}));
vi.mock("@firebase-oss/ui-core", () => ({
  initializeUI: mocks.initializeUI,
  providerPopupStrategy: mocks.providerPopupStrategy,
  providerRedirectStrategy: mocks.providerRedirectStrategy,
}));
vi.mock("firebase/firestore", () => ({
  connectFirestoreEmulator: mocks.connectFirestoreEmulator,
  getFirestore: mocks.getFirestore,
}));
vi.mock("firebase/functions", () => ({
  connectFunctionsEmulator: mocks.connectFunctionsEmulator,
  getFunctions: mocks.getFunctions,
}));
vi.mock("firebase/storage", () => ({
  connectStorageEmulator: mocks.connectStorageEmulator,
  getStorage: mocks.getStorage,
}));

describe("getFirebaseUI", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    vi.stubEnv("NEXT_PUBLIC_FIREBASE_API_KEY", "api-key");
    vi.stubEnv("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN", "example.firebaseapp.com");
    vi.stubEnv("NEXT_PUBLIC_FIREBASE_PROJECT_ID", "example");
    vi.stubEnv("NEXT_PUBLIC_FIREBASE_APP_ID", "app-id");
    delete process.env.FIREBASE_AUTH_EMULATOR_HOST;
    delete process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST;
    delete process.env.NEXT_PUBLIC_FIRESTORE_EMULATOR_HOST;
    delete process.env.FIREBASE_STORAGE_EMULATOR_HOST;
    delete process.env.NEXT_PUBLIC_FIREBASE_STORAGE_EMULATOR_HOST;
    delete process.env.FIREBASE_DATABASE_EMULATOR_HOST;
    delete process.env.NEXT_PUBLIC_FIREBASE_DATABASE_EMULATOR_HOST;
    delete process.env.FUNCTIONS_EMULATOR_HOST;
    delete process.env.NEXT_PUBLIC_FIREBASE_FUNCTIONS_EMULATOR_HOST;
    mocks.apps = [];
    mocks.getApps.mockImplementation(() => mocks.apps);
    mocks.getApp.mockReturnValue(mocks.app);
    mocks.getAuth.mockReturnValue(mocks.auth);
    mocks.initializeApp.mockReturnValue(mocks.app);
    mocks.initializeUI.mockReturnValue(mocks.store);
    mocks.providerPopupStrategy.mockReturnValue(mocks.popupStrategy);
    mocks.providerRedirectStrategy.mockReturnValue(mocks.redirectStrategy);
    globalThis.firebaseUIStore = undefined;
    globalThis.firebaseAuthEmulatorConnected = false;
    globalThis.firebaseStorageEmulatorConnected = false;
    globalThis.firebaseFunctionsEmulatorConnected = false;
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    globalThis.firebaseUIStore = undefined;
    globalThis.firebaseAuthEmulatorConnected = false;
    globalThis.firebaseStorageEmulatorConnected = false;
    globalThis.firebaseFunctionsEmulatorConnected = false;
  });

  it("reports missing public configuration", async () => {
    vi.stubEnv("NEXT_PUBLIC_FIREBASE_API_KEY", "");
    vi.stubEnv("NEXT_PUBLIC_FIREBASE_APP_ID", "");

    const { getFirebaseUI } = await import("./client");
    expect(() => getFirebaseUI()).toThrow(
      "Missing Firebase configuration: apiKey, appId. See .env.example.",
    );
    expect(mocks.initializeApp).not.toHaveBeenCalled();
  });

  it("rejects emulator use outside development", async () => {
    vi.stubEnv("NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST", "127.0.0.1:9099");

    const { getFirebaseUI } = await import("./client");
    expect(() => getFirebaseUI()).toThrow(
      "The Auth emulator requires development mode. See .env.example.",
    );
  });

  it("initializes Firebase and connects the emulator in development", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST", "127.0.0.1:9098");

    const { getFirebaseUI } = await import("./client");
    expect(getFirebaseUI()).toBe(mocks.store);
    expect(mocks.initializeApp).toHaveBeenCalledWith({
      apiKey: "api-key",
      authDomain: "example.firebaseapp.com",
      projectId: "example",
      appId: "app-id",
      storageBucket: "example.appspot.com",
    });
    expect(mocks.connectAuthEmulator).toHaveBeenCalledWith(
      mocks.auth,
      "http://127.0.0.1:9098",
    );
    expect(mocks.initializeUI).toHaveBeenCalledWith({
      app: mocks.app,
      auth: mocks.auth,
      behaviors: [mocks.popupStrategy],
    });
  });

  it("uses redirect OAuth in Electron browsers", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST", "localhost:9099");
    vi.stubGlobal("navigator", { userAgent: "Mozilla/5.0 Electron/42.0.0" });
    vi.stubGlobal("window", { location: { origin: "http://localhost:3000" } });

    const { getFirebaseUI } = await import("./client");
    expect(getFirebaseUI()).toBe(mocks.store);
    expect(mocks.connectAuthEmulator).toHaveBeenCalledWith(
      mocks.auth,
      "http://localhost:3000",
    );
    expect(mocks.initializeUI).toHaveBeenCalledWith({
      app: mocks.app,
      auth: mocks.auth,
      behaviors: [mocks.redirectStrategy],
    });
  });

  it("connects the Auth emulator once across repeated calls", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST", "127.0.0.1:9098");

    const { getFirebaseUI } = await import("./client");
    expect(getFirebaseUI()).toBe(getFirebaseUI());
    expect(mocks.connectAuthEmulator).toHaveBeenCalledOnce();
  });

  it("reuses an existing app and UI store", async () => {
    mocks.apps = [mocks.app];
    globalThis.firebaseUIStore = mocks.store as never;

    const { getFirebaseUI } = await import("./client");
    expect(getFirebaseUI()).toBe(mocks.store);
    expect(mocks.getApp).toHaveBeenCalledOnce();
    expect(mocks.initializeApp).not.toHaveBeenCalled();
    expect(mocks.initializeUI).not.toHaveBeenCalled();
  });

  it("connects browser Firestore using its public emulator endpoint", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("NEXT_PUBLIC_FIRESTORE_EMULATOR_HOST", "127.0.0.1:8080");
    const firestore = { app: mocks.app };
    mocks.getFirestore.mockReturnValue(firestore);

    const { getFirebaseFirestore } = await import("./client");
    expect(getFirebaseFirestore()).toBe(firestore);
    expect(mocks.connectFirestoreEmulator).toHaveBeenCalledWith(
      firestore,
      "127.0.0.1",
      8080,
    );
  });

  it("connects browser Storage to the local emulator using public configuration", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("NEXT_PUBLIC_FIREBASE_STORAGE_EMULATOR_HOST", "127.0.0.1:9199");
    const storage = { app: mocks.app };
    mocks.getStorage.mockReturnValue(storage);

    const { getFirebaseStorage } = await import("./client");
    expect(getFirebaseStorage()).toBe(storage);
    expect(mocks.connectStorageEmulator).toHaveBeenCalledWith(
      storage,
      "127.0.0.1",
      9199,
    );
  });

  it("connects Functions to its public emulator endpoint", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv(
      "NEXT_PUBLIC_FIREBASE_FUNCTIONS_EMULATOR_HOST",
      "127.0.0.1:5001",
    );
    const functions = { app: mocks.app };
    mocks.getFunctions.mockReturnValue(functions);

    const { getFirebaseFunctions } = await import("./client");
    expect(getFirebaseFunctions()).toBe(functions);
    expect(mocks.connectFunctionsEmulator).toHaveBeenCalledWith(
      functions,
      "127.0.0.1",
      5001,
    );
  });

  it("does not connect Storage or Functions emulators outside development", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_FIREBASE_STORAGE_EMULATOR_HOST", "127.0.0.1:9199");
    vi.stubEnv(
      "NEXT_PUBLIC_FIREBASE_FUNCTIONS_EMULATOR_HOST",
      "127.0.0.1:5001",
    );
    const storage = { app: mocks.app };
    const functions = { app: mocks.app };
    mocks.getStorage.mockReturnValue(storage);
    mocks.getFunctions.mockReturnValue(functions);

    const { getFirebaseStorage, getFirebaseFunctions } = await import(
      "./client"
    );
    expect(getFirebaseStorage()).toBe(storage);
    expect(getFirebaseFunctions()).toBe(functions);
    expect(mocks.connectStorageEmulator).not.toHaveBeenCalled();
    expect(mocks.connectFunctionsEmulator).not.toHaveBeenCalled();
  });
  it("starts App Check once when a site key is configured", async () => {
    vi.stubEnv("NEXT_PUBLIC_FIREBASE_APPCHECK_SITE_KEY", "site-key");
    mocks.getFunctions.mockReturnValue({});

    const { getFirebaseFunctions } = await import("./client");
    getFirebaseFunctions();
    getFirebaseFunctions();

    expect(mocks.ReCaptchaV3Provider).toHaveBeenCalledWith("site-key");
    expect(mocks.initializeAppCheck).toHaveBeenCalledTimes(1);
    expect(mocks.initializeAppCheck).toHaveBeenCalledWith(
      mocks.app,
      expect.objectContaining({ isTokenAutoRefreshEnabled: true }),
    );
  });

  it("skips App Check without a site key", async () => {
    mocks.getFunctions.mockReturnValue({});

    const { getFirebaseFunctions } = await import("./client");
    getFirebaseFunctions();

    expect(mocks.initializeAppCheck).not.toHaveBeenCalled();
  });
});

describe("Firebase Auth browser helpers", () => {
  const stop = vi.fn();
  let emit: (user: User | null) => void;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    vi.stubEnv("NEXT_PUBLIC_FIREBASE_API_KEY", "api-key");
    vi.stubEnv("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN", "example.firebaseapp.com");
    vi.stubEnv("NEXT_PUBLIC_FIREBASE_PROJECT_ID", "example");
    vi.stubEnv("NEXT_PUBLIC_FIREBASE_APP_ID", "app-id");
    delete process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST;
    mocks.apps = [];
    mocks.getApps.mockImplementation(() => mocks.apps);
    mocks.initializeApp.mockReturnValue(mocks.app);
    mocks.getAuth.mockReturnValue(mocks.auth);
    mocks.initializeUI.mockReturnValue({ get: () => ({ auth: mocks.auth }) });
    mocks.getPendingSignOut.mockReturnValue(null);
    mocks.onAuthStateChanged.mockImplementation(
      (_auth: unknown, callback: (user: User | null) => void) => {
        emit = callback;
        return stop;
      },
    );
    globalThis.firebaseUIStore = undefined;
    globalThis.firebaseAuthEmulatorConnected = false;
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    globalThis.firebaseUIStore = undefined;
  });

  it("getFirebaseAuthUser returns the current user, or null when signed out", async () => {
    const { getFirebaseAuthUser } = await import("./client");
    mocks.auth.currentUser = { uid: "u1" };
    expect(getFirebaseAuthUser()).toBe(mocks.auth.currentUser);
    mocks.auth.currentUser = null;
    expect(getFirebaseAuthUser()).toBeNull();
  });

  it("subscribeToAuth forwards users and unsubscribes from Firebase", async () => {
    const { subscribeToAuth } = await import("./client");
    const onChange = vi.fn();
    const user = { uid: "u1" } as User;
    const unsubscribe = subscribeToAuth(onChange);
    expect(mocks.onAuthStateChanged).toHaveBeenCalledWith(
      mocks.auth,
      expect.any(Function),
    );

    emit(user);
    emit(null);
    expect(onChange).toHaveBeenNthCalledWith(1, user);
    expect(onChange).toHaveBeenNthCalledWith(2, null);

    unsubscribe();
    expect(stop).toHaveBeenCalledOnce();
  });

  it("subscribeToAuth holds sign-out until persistence completes", async () => {
    const { subscribeToAuth } = await import("./client");
    const onChange = vi.fn();
    subscribeToAuth(onChange);
    const deferred = Promise.withResolvers<void>();
    mocks.getPendingSignOut.mockReturnValue(deferred.promise);

    emit(null);
    expect(onChange).not.toHaveBeenCalled();
    deferred.resolve();
    await deferred.promise;
    expect(onChange).toHaveBeenCalledExactlyOnceWith(null);
  });

  it("subscribeToAuth ignores a held sign-out once a newer session arrives", async () => {
    const { subscribeToAuth } = await import("./client");
    const onChange = vi.fn();
    const next = { uid: "u2" } as User;
    subscribeToAuth(onChange);
    const deferred = Promise.withResolvers<void>();
    mocks.getPendingSignOut.mockReturnValue(deferred.promise);

    emit(null);
    emit(next);
    deferred.resolve();
    await deferred.promise;
    expect(onChange).toHaveBeenCalledExactlyOnceWith(next);
  });

  it("subscribeToAuth drops a held sign-out after unsubscribing", async () => {
    const { subscribeToAuth } = await import("./client");
    const onChange = vi.fn();
    const unsubscribe = subscribeToAuth(onChange);
    const deferred = Promise.withResolvers<void>();
    mocks.getPendingSignOut.mockReturnValue(deferred.promise);

    emit(null);
    unsubscribe();
    deferred.resolve();
    await deferred.promise;
    expect(onChange).not.toHaveBeenCalled();
  });

  it("subscribeToAuth still settles when sign-out persistence fails", async () => {
    const { subscribeToAuth } = await import("./client");
    const onChange = vi.fn();
    subscribeToAuth(onChange);
    mocks.getPendingSignOut.mockReturnValue(Promise.reject(new Error("x")));

    emit(null);
    await vi.waitFor(() => expect(onChange).toHaveBeenCalledWith(null));
  });

  it("getActiveFirebaseAuthUser requires a current user with the expected uid", async () => {
    const { getActiveFirebaseAuthUser } = await import("./client");
    const expected = { uid: "u1" } as User;
    mocks.auth.currentUser = { uid: "u1" };
    expect(getActiveFirebaseAuthUser(expected)).toBe(mocks.auth.currentUser);
    mocks.auth.currentUser = null;
    expect(() => getActiveFirebaseAuthUser(expected)).toThrow(
      "Authentication session unavailable",
    );
    mocks.auth.currentUser = { uid: "other" };
    expect(() => getActiveFirebaseAuthUser(expected)).toThrow(
      "Authentication session unavailable",
    );
  });
});
