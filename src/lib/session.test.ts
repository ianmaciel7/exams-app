import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  cookieDelete: vi.fn(),
  getFirebaseServerSession: vi.fn(),
}));

vi.mock("next/headers", () => ({
  cookies: async () => ({ delete: mocks.cookieDelete }),
}));
vi.mock("@/lib/firebase/admin", () => ({ getAdminAuth: vi.fn() }));
vi.mock("@/lib/firebase/server", () => ({
  getFirebaseServerSession: mocks.getFirebaseServerSession,
}));

import {
  deleteSession,
  describeSessionFailure,
  getSession,
  SESSION_COOKIE_NAME,
} from "./session";

describe("getSession", () => {
  beforeEach(() => vi.clearAllMocks());

  it("reports a verified identity as authenticated", async () => {
    mocks.getFirebaseServerSession.mockResolvedValue({
      role: "admin",
      userId: "a1",
      displayName: "Ada",
    });
    await expect(getSession()).resolves.toEqual({
      displayName: "Ada",
      isAuthenticated: true,
      role: "admin",
      userId: "a1",
    });
  });

  it("reports a visitor without identity as unauthenticated", async () => {
    mocks.getFirebaseServerSession.mockResolvedValue({
      role: "user",
      userId: null,
    });
    await expect(getSession()).resolves.toEqual({
      displayName: null,
      isAuthenticated: false,
      role: "user",
      userId: null,
    });
  });
});

describe("deleteSession", () => {
  it("deletes the session cookie", async () => {
    await deleteSession();
    expect(mocks.cookieDelete).toHaveBeenCalledWith(SESSION_COOKIE_NAME);
    expect(SESSION_COOKIE_NAME).toBe("__session");
  });
});

describe("describeSessionFailure", () => {
  it("returns the Firebase error code and message and logs them", () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    const error = Object.assign(new Error("expired"), {
      code: "auth/id-token-expired",
    });
    expect(describeSessionFailure(error)).toEqual({
      code: "auth/id-token-expired",
      message: "expired",
    });
    expect(log).toHaveBeenCalledWith(
      "Failed to create Firebase session cookie [auth/id-token-expired]: expired",
    );
    log.mockRestore();
  });

  it("falls back for errors without a code", () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(describeSessionFailure("boom")).toEqual({
      code: undefined,
      message: "Unknown error",
    });
    log.mockRestore();
  });
});
