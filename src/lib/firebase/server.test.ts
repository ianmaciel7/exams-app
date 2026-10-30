import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  headers: new Headers(),
  connection: vi.fn(),
  verifyIdToken: vi.fn(),
  renderScope: null as { session?: unknown } | null,
}));

// React only memoizes during a server render, so model one render pass here.
vi.mock("react", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react")>()),
  cache:
    <T>(load: () => T) =>
    () => {
      if (!mocks.renderScope) return load();
      mocks.renderScope.session ??= load();
      return mocks.renderScope.session as T;
    },
}));
vi.mock("next/headers", () => ({ headers: async () => mocks.headers }));
vi.mock("next/server", () => ({ connection: mocks.connection }));
vi.mock("./admin", () => ({
  getAdminAuth: () => ({ verifyIdToken: mocks.verifyIdToken }),
}));

import { getFirebaseServerSession } from "./server";

function setHeaders(values: Record<string, string>) {
  mocks.headers = new Headers(values);
}

describe("getFirebaseServerSession", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.renderScope = null;
  });

  it("verifies once per render pass", async () => {
    setHeaders({ "x-firebase-auth-bridge": "1", authorization: "Bearer t" });
    mocks.verifyIdToken.mockResolvedValue({ uid: "a1", role: "admin" });
    mocks.renderScope = {};
    await getFirebaseServerSession();
    await getFirebaseServerSession();
    expect(mocks.verifyIdToken).toHaveBeenCalledOnce();
  });

  it("does not verify without the worker bridge or a bearer token", async () => {
    setHeaders({ authorization: "Bearer t" });
    expect(await getFirebaseServerSession()).toEqual({
      isBridgeActive: false,
      role: "user",
      userId: null,
    });
    setHeaders({ "x-firebase-auth-bridge": "1" });
    expect((await getFirebaseServerSession()).userId).toBeNull();
    expect(mocks.verifyIdToken).not.toHaveBeenCalled();
    expect(mocks.connection).not.toHaveBeenCalled();
  });

  it("verifies with revocation checks and exposes the role claim", async () => {
    setHeaders({ "x-firebase-auth-bridge": "1", authorization: "Bearer t" });
    mocks.verifyIdToken.mockResolvedValue({ uid: "a1", role: "admin" });
    expect(await getFirebaseServerSession()).toEqual({
      isBridgeActive: true,
      role: "admin",
      userId: "a1",
    });
    expect(mocks.verifyIdToken).toHaveBeenCalledWith("t", true);
    expect(mocks.connection).toHaveBeenCalledOnce();
  });

  it.each([
    "auth/id-token-revoked",
    "auth/id-token-expired",
    "auth/argument-error",
    "auth/user-disabled",
  ])("treats a %s token as unauthenticated", async (code) => {
    setHeaders({ "x-firebase-auth-bridge": "1", authorization: "Bearer t" });
    mocks.verifyIdToken.mockRejectedValue(
      Object.assign(new Error(code), { code }),
    );
    const logged = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(await getFirebaseServerSession()).toEqual({
      isBridgeActive: true,
      role: "user",
      userId: null,
    });
    expect(logged).toHaveBeenCalledWith(
      "Firebase ID token verification failed",
      expect.objectContaining({ code }),
    );
    logged.mockRestore();
  });

  it.each([
    "app/invalid-credential",
    "app/network-error",
    "auth/internal-error",
  ])(
    "surfaces a %s server fault instead of a sign-in redirect",
    async (code) => {
      setHeaders({ "x-firebase-auth-bridge": "1", authorization: "Bearer t" });
      const fault = Object.assign(new Error(code), { code });
      mocks.verifyIdToken.mockRejectedValue(fault);
      await expect(getFirebaseServerSession()).rejects.toBe(fault);
    },
  );
});
