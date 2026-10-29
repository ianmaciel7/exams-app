import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  headers: new Headers(),
  connection: vi.fn(),
  verifyIdToken: vi.fn(),
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
  beforeEach(() => vi.clearAllMocks());

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

  it("treats revoked or malformed tokens as unauthenticated", async () => {
    setHeaders({ "x-firebase-auth-bridge": "1", authorization: "Bearer t" });
    mocks.verifyIdToken.mockRejectedValue(new Error("auth/id-token-revoked"));
    const logged = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(await getFirebaseServerSession()).toEqual({
      isBridgeActive: true,
      role: "user",
      userId: null,
    });
    expect(logged).toHaveBeenCalledWith(
      "Firebase ID token verification failed",
      expect.objectContaining({ message: "auth/id-token-revoked" }),
    );
    logged.mockRestore();
  });
});
