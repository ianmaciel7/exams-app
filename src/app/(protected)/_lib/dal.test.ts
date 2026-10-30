import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getFirebaseServerSession: vi.fn(),
  notFound: vi.fn(() => {
    throw new Error("NOT_FOUND");
  }),
  redirectToSignIn: vi.fn(() => {
    throw new Error("SIGN_IN");
  }),
}));

vi.mock("next/navigation", () => ({ notFound: mocks.notFound }));
vi.mock("@/lib/firebase/server", () => ({
  getFirebaseServerSession: mocks.getFirebaseServerSession,
}));
vi.mock("@/lib/navigation", () => ({
  redirectToSignIn: mocks.redirectToSignIn,
}));

import { verifyRole, verifySession } from "./dal";

describe("verifySession", () => {
  beforeEach(() => vi.clearAllMocks());

  it("allows first-load fallback when the worker bridge is inactive", async () => {
    mocks.getFirebaseServerSession.mockResolvedValue({
      isBridgeActive: false,
      role: "user",
      userId: null,
    });
    await expect(verifySession()).resolves.toBeUndefined();
    expect(mocks.redirectToSignIn).not.toHaveBeenCalled();
  });

  it("redirects when the worker bridge is active but the token did not verify", async () => {
    mocks.getFirebaseServerSession.mockResolvedValue({
      isBridgeActive: true,
      role: "user",
      userId: null,
    });
    await expect(verifySession()).rejects.toThrow("SIGN_IN");
  });

  it("allows verified sessions when the worker bridge is active", async () => {
    mocks.getFirebaseServerSession.mockResolvedValue({
      isBridgeActive: true,
      role: "user",
      userId: "u1",
    });
    await expect(verifySession()).resolves.toBeUndefined();
    expect(mocks.redirectToSignIn).not.toHaveBeenCalled();
  });
});

describe("verifyRole", () => {
  beforeEach(() => vi.clearAllMocks());

  it("sends callers without a verified session to sign-in, even if the bridge is off", async () => {
    mocks.getFirebaseServerSession.mockResolvedValue({
      isBridgeActive: false,
      role: "user",
      userId: null,
    });
    await expect(verifyRole("user")).rejects.toThrow("SIGN_IN");
  });

  it("answers an insufficient role as not found", async () => {
    mocks.getFirebaseServerSession.mockResolvedValue({
      isBridgeActive: true,
      role: "user",
      userId: "u1",
    });
    await expect(verifyRole("admin")).rejects.toThrow("NOT_FOUND");
  });

  it("returns the verified identity when the role suffices", async () => {
    mocks.getFirebaseServerSession.mockResolvedValue({
      isBridgeActive: true,
      role: "admin",
      userId: "a1",
    });
    await expect(verifyRole("user")).resolves.toEqual({
      role: "admin",
      userId: "a1",
    });
  });
});
