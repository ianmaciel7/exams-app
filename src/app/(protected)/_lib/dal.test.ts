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

import { verifyRole, verifySession } from "./dal";

describe("verifySession", () => {
  beforeEach(() => vi.clearAllMocks());

  it("fails closed without a verified identity", async () => {
    mocks.getFirebaseServerSession.mockResolvedValue({
      role: "user",
      userId: null,
    });
    await expect(verifySession()).rejects.toThrow("SIGN_IN");
    expect(mocks.redirectToSignIn).toHaveBeenCalledOnce();
  });

  it("returns only the verified identity", async () => {
    mocks.getFirebaseServerSession.mockResolvedValue({
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

  it("sends callers without a verified session to sign-in", async () => {
    mocks.getFirebaseServerSession.mockResolvedValue({
      role: "user",
      userId: null,
    });
    await expect(verifyRole("user")).rejects.toThrow("SIGN_IN");
  });

  it("answers an insufficient role as not found", async () => {
    mocks.getFirebaseServerSession.mockResolvedValue({
      role: "user",
      userId: "u1",
    });
    await expect(verifyRole("admin")).rejects.toThrow("NOT_FOUND");
  });

  it("returns the verified identity when the role suffices", async () => {
    mocks.getFirebaseServerSession.mockResolvedValue({
      role: "admin",
      userId: "a1",
    });
    await expect(verifyRole("user")).resolves.toEqual({
      role: "admin",
      userId: "a1",
    });
  });
});
