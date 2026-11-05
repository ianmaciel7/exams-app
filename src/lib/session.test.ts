import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  cookieDelete: vi.fn(),
  getFirebaseServerSession: vi.fn(),
}));

vi.mock("next/headers", () => ({
  cookies: async () => ({ delete: mocks.cookieDelete }),
}));
vi.mock("@/lib/firebase/server", () => ({
  getFirebaseServerSession: mocks.getFirebaseServerSession,
}));

import { deleteSession, getSession, SESSION_COOKIE_NAME } from "./session";

describe("getSession", () => {
  beforeEach(() => vi.clearAllMocks());

  it("reports a verified identity as authenticated", async () => {
    mocks.getFirebaseServerSession.mockResolvedValue({
      role: "admin",
      userId: "a1",
    });
    await expect(getSession()).resolves.toEqual({
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
