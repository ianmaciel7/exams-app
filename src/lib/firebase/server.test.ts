import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  headers: new Headers(),
  cookies: new Map<string, { value: string }>(),
  connection: vi.fn(),
  verifyIdToken: vi.fn(),
  verifySessionCookie: vi.fn(),
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
vi.mock("next/headers", () => ({
  headers: async () => mocks.headers,
  cookies: async () => ({
    get: (name: string) => mocks.cookies.get(name),
  }),
}));
vi.mock("next/server", () => ({ connection: mocks.connection }));
vi.mock("./admin", () => ({
  getAdminAuth: () => ({
    verifyIdToken: mocks.verifyIdToken,
    verifySessionCookie: mocks.verifySessionCookie,
  }),
}));

import { getFirebaseServerSession } from "./server";

function setHeaders(values: Record<string, string>) {
  mocks.headers = new Headers(values);
}

function setCookie(name: string, value: string) {
  mocks.cookies.set(name, { value });
}

describe("getFirebaseServerSession", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.headers = new Headers();
    mocks.cookies.clear();
    mocks.renderScope = null;
  });

  it("verifies once per render pass", async () => {
    setCookie("__session", "session-cookie-1");
    mocks.verifySessionCookie.mockResolvedValue({ uid: "a1", role: "admin" });
    mocks.renderScope = {};
    await getFirebaseServerSession();
    await getFirebaseServerSession();
    expect(mocks.verifySessionCookie).toHaveBeenCalledOnce();
  });

  it("verifies the __session cookie with revocation checks", async () => {
    setCookie("__session", "session-cookie-1");
    mocks.verifySessionCookie.mockResolvedValue({
      uid: "u1",
      role: "user",
      name: " Ada Lovelace ",
    });
    const session = await getFirebaseServerSession();
    expect(session).toEqual({
      role: "user",
      userId: "u1",
      displayName: "Ada Lovelace",
    });
    expect(mocks.verifySessionCookie).toHaveBeenCalledWith(
      "session-cookie-1",
      true,
    );
    expect(mocks.connection).toHaveBeenCalledOnce();
  });

  it("falls back to bearer authorization token when cookie is absent", async () => {
    setHeaders({ authorization: "Bearer id-token-1" });
    mocks.verifyIdToken.mockResolvedValue({ uid: "u2", role: "admin" });
    const session = await getFirebaseServerSession();
    expect(session).toEqual({
      role: "admin",
      userId: "u2",
      displayName: null,
    });
    expect(mocks.verifyIdToken).toHaveBeenCalledWith("id-token-1", true);
  });

  it("returns unauthenticated without credentials", async () => {
    expect(await getFirebaseServerSession()).toEqual({
      role: "user",
      userId: null,
    });
    expect(mocks.verifySessionCookie).not.toHaveBeenCalled();
    expect(mocks.verifyIdToken).not.toHaveBeenCalled();
  });

  it.each([
    "auth/session-cookie-expired",
    "auth/session-cookie-revoked",
    "auth/id-token-revoked",
    "auth/id-token-expired",
    "auth/argument-error",
    "auth/user-disabled",
    "auth/user-not-found",
  ])("treats a %s token as unauthenticated", async (code) => {
    setCookie("__session", "bad-cookie");
    mocks.verifySessionCookie.mockRejectedValue(
      Object.assign(new Error(code), { code }),
    );
    const logged = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(await getFirebaseServerSession()).toEqual({
      role: "user",
      userId: null,
    });
    expect(logged).toHaveBeenCalledWith(
      "Firebase session verification failed",
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
      setCookie("__session", "err-cookie");
      const fault = Object.assign(new Error(code), { code });
      mocks.verifySessionCookie.mockRejectedValue(fault);
      await expect(getFirebaseServerSession()).rejects.toBe(fault);
    },
  );
});
