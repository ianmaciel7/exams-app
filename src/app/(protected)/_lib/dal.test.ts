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
  routes: { home: "/" },
}));

import { rejectInvalidBridgeSession, verifyRole, verifySession } from "./dal";

describe("rejectInvalidBridgeSession", () => {
  beforeEach(() => vi.clearAllMocks());

  it("tolerates the first load when the worker bridge is inactive", async () => {
    mocks.getFirebaseServerSession.mockResolvedValue({
      isBridgeActive: false,
      role: "user",
      userId: null,
    });
    await expect(rejectInvalidBridgeSession()).resolves.toBeUndefined();
    expect(mocks.redirectToSignIn).not.toHaveBeenCalled();
  });

  it("redirects home-bound when the worker's token did not verify", async () => {
    mocks.getFirebaseServerSession.mockResolvedValue({
      isBridgeActive: true,
      role: "user",
      userId: null,
    });
    await expect(rejectInvalidBridgeSession()).rejects.toThrow("SIGN_IN");
    // A protected return path would loop for a client that still has a session.
    expect(mocks.redirectToSignIn).toHaveBeenCalledWith("/");
  });

  it("lets verified sessions continue", async () => {
    mocks.getFirebaseServerSession.mockResolvedValue({
      isBridgeActive: true,
      role: "user",
      userId: "u1",
    });
    await expect(rejectInvalidBridgeSession()).resolves.toBeUndefined();
    expect(mocks.redirectToSignIn).not.toHaveBeenCalled();
  });
});

describe("verifySession", () => {
  beforeEach(() => vi.clearAllMocks());

  it.each([true, false])(
    "fails closed without a verified identity (bridge active: %s)",
    async (isBridgeActive) => {
      mocks.getFirebaseServerSession.mockResolvedValue({
        isBridgeActive,
        role: "user",
        userId: null,
      });
      await expect(verifySession()).rejects.toThrow("SIGN_IN");
    },
  );

  it("returns only the verified identity", async () => {
    mocks.getFirebaseServerSession.mockResolvedValue({
      isBridgeActive: true,
      role: "admin",
      userId: "a1",
    });
    await expect(verifySession()).resolves.toEqual({
      role: "admin",
      userId: "a1",
    });
  });

  it("propagates infrastructure faults instead of redirecting", async () => {
    const fault = Object.assign(new Error("offline"), {
      code: "auth/internal-error",
    });
    mocks.getFirebaseServerSession.mockRejectedValue(fault);
    await expect(verifySession()).rejects.toBe(fault);
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
