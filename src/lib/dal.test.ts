import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getSession: vi.fn(),
  notFound: vi.fn(() => {
    throw new Error("NOT_FOUND");
  }),
  redirectToSignIn: vi.fn(() => {
    throw new Error("SIGN_IN");
  }),
}));

vi.mock("next/navigation", () => ({ notFound: mocks.notFound }));
vi.mock("@/lib/session", () => ({ getSession: mocks.getSession }));
vi.mock("@/lib/navigation", () => ({
  redirectToSignIn: mocks.redirectToSignIn,
  routes: { home: "/" },
}));

import { verifyRole, verifySession } from "./dal";

describe("verifySession", () => {
  beforeEach(() => vi.clearAllMocks());

  it("fails closed without a verified identity", async () => {
    mocks.getSession.mockResolvedValue({
      role: "user",
      userId: null,
      isAuthenticated: false,
    });
    await expect(verifySession()).rejects.toThrow("SIGN_IN");
    expect(mocks.redirectToSignIn).toHaveBeenCalledOnce();
  });

  it("returns only the verified identity", async () => {
    mocks.getSession.mockResolvedValue({
      role: "admin",
      userId: "a1",
      isAuthenticated: true,
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
    mocks.getSession.mockRejectedValue(fault);
    await expect(verifySession()).rejects.toBe(fault);
    expect(mocks.redirectToSignIn).not.toHaveBeenCalled();
  });
});

describe("verifyRole", () => {
  beforeEach(() => vi.clearAllMocks());

  it("sends callers without a verified session to sign-in", async () => {
    mocks.getSession.mockResolvedValue({
      role: "user",
      userId: null,
      isAuthenticated: false,
    });
    await expect(verifyRole("user")).rejects.toThrow("SIGN_IN");
  });

  it("answers an insufficient role as not found", async () => {
    mocks.getSession.mockResolvedValue({
      role: "user",
      userId: "u1",
      isAuthenticated: true,
    });
    await expect(verifyRole("admin")).rejects.toThrow("NOT_FOUND");
  });

  it("returns the verified identity when the role suffices", async () => {
    mocks.getSession.mockResolvedValue({
      role: "admin",
      userId: "a1",
      isAuthenticated: true,
    });
    await expect(verifyRole("user")).resolves.toEqual({
      role: "admin",
      userId: "a1",
    });
  });
});
