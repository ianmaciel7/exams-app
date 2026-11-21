import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  app: { name: "[DEFAULT]" },
  apps: [] as { name: string }[],
  auth: { currentUser: null },
  store: { id: "firebase-ui" },
  getApp: vi.fn(),
  getApps: vi.fn(),
  getAuth: vi.fn(),
  getDatabase: vi.fn(),
  getFunctions: vi.fn(),
  initializeApp: vi.fn(),
  initializeUI: vi.fn(),
  popupStrategy: { strategy: "popup" },
  redirectStrategy: { strategy: "redirect" },
  providerPopupStrategy: vi.fn(),
  providerRedirectStrategy: vi.fn(),
  connectAuthEmulator: vi.fn(),
  connectDatabaseEmulator: vi.fn(),
  connectFirestoreEmulator: vi.fn(),
  connectFunctionsEmulator: vi.fn(),
  connectStorageEmulator: vi.fn(),
  getFirestore: vi.fn(),
  getStorage: vi.fn(),
}));

vi.mock("firebase/app", () => ({
  getApp: mocks.getApp,
  getApps: mocks.getApps,
  initializeApp: mocks.initializeApp,
}));
vi.mock("firebase/auth", () => ({
  connectAuthEmulator: mocks.connectAuthEmulator,
  getAuth: mocks.getAuth,
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
vi.mock("firebase/database", () => ({
  connectDatabaseEmulator: mocks.connectDatabaseEmulator,
  getDatabase: mocks.getDatabase,
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
    globalThis.firebaseDatabaseEmulatorConnected = false;
    globalThis.firebaseStorageEmulatorConnected = false;
    globalThis.firebaseFunctionsEmulatorConnected = false;
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    globalThis.firebaseUIStore = undefined;
    globalThis.firebaseAuthEmulatorConnected = false;
    globalThis.firebaseDatabaseEmulatorConnected = false;
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

  it("returns the shared Auth instance and connects its emulator once", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST", "127.0.0.1:9098");

    const { getFirebaseAuth } = await import("./client");
    expect(getFirebaseAuth()).toBe(mocks.auth);
    expect(getFirebaseAuth()).toBe(mocks.auth);
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

  it("connects Database and Functions to their public emulator endpoints", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("NEXT_PUBLIC_FIREBASE_DATABASE_EMULATOR_HOST", "127.0.0.1:9000");
    vi.stubEnv(
      "NEXT_PUBLIC_FIREBASE_FUNCTIONS_EMULATOR_HOST",
      "127.0.0.1:5001",
    );
    const database = { app: mocks.app };
    const functions = { app: mocks.app };
    mocks.getDatabase.mockReturnValue(database);
    mocks.getFunctions.mockReturnValue(functions);

    const { getFirebaseDatabase, getFirebaseFunctions } = await import(
      "./client"
    );
    expect(getFirebaseDatabase()).toBe(database);
    expect(getFirebaseFunctions()).toBe(functions);
    expect(mocks.connectDatabaseEmulator).toHaveBeenCalledWith(
      database,
      "127.0.0.1",
      9000,
    );
    expect(mocks.connectFunctionsEmulator).toHaveBeenCalledWith(
      functions,
      "127.0.0.1",
      5001,
    );
  });

  it("does not connect Storage, Database, or Functions emulators outside development", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_FIREBASE_STORAGE_EMULATOR_HOST", "127.0.0.1:9199");
    vi.stubEnv("NEXT_PUBLIC_FIREBASE_DATABASE_EMULATOR_HOST", "127.0.0.1:9000");
    vi.stubEnv(
      "NEXT_PUBLIC_FIREBASE_FUNCTIONS_EMULATOR_HOST",
      "127.0.0.1:5001",
    );
    const storage = { app: mocks.app };
    const database = { app: mocks.app };
    const functions = { app: mocks.app };
    mocks.getStorage.mockReturnValue(storage);
    mocks.getDatabase.mockReturnValue(database);
    mocks.getFunctions.mockReturnValue(functions);

    const { getFirebaseStorage, getFirebaseDatabase, getFirebaseFunctions } =
      await import("./client");
    expect(getFirebaseStorage()).toBe(storage);
    expect(getFirebaseDatabase()).toBe(database);
    expect(getFirebaseFunctions()).toBe(functions);
    expect(mocks.connectStorageEmulator).not.toHaveBeenCalled();
    expect(mocks.connectDatabaseEmulator).not.toHaveBeenCalled();
    expect(mocks.connectFunctionsEmulator).not.toHaveBeenCalled();
  });

  it("provides get for Hosting, PubSub, and Extensions", async () => {
    vi.stubEnv("NEXT_PUBLIC_FIREBASE_PROJECT_ID", "example-proj");
    vi.stubEnv("NEXT_PUBLIC_FIREBASE_HOSTING_EMULATOR_HOST", "127.0.0.1:5000");
    vi.stubEnv(
      "NEXT_PUBLIC_FIREBASE_EXTENSIONS_EMULATOR_HOST",
      "127.0.0.1:5003",
    );

    const { getFirebaseHosting, getFirebasePubSub, getFirebaseExtensions } =
      await import("./client");

    expect(getFirebaseHosting().url).toBe("http://127.0.0.1:5000");
    expect(getFirebaseExtensions()).toEqual({
      emulatorUrl: "http://127.0.0.1:5003",
    });
    expect(getFirebasePubSub()).toBeDefined();
    expect(typeof getFirebasePubSub().publish).toBe("function");
  });
});
