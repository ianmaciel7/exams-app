import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  auth: { id: "auth" },
  signOut: vi.fn(),
}));

vi.mock("firebase/auth", () => ({ signOut: mocks.signOut }));
vi.mock("@/lib/firebase/client", () => ({
  getFirebaseUI: () => ({ get: () => ({ auth: mocks.auth }) }),
}));

import { signOutUser } from "./auth";

describe("signOutUser", () => {
  beforeEach(() => vi.clearAllMocks());

  it("signs out of the shared Auth instance", async () => {
    mocks.signOut.mockResolvedValue(undefined);
    await signOutUser();
    expect(mocks.signOut).toHaveBeenCalledWith(mocks.auth);
  });

  it("propagates sign-out failures", async () => {
    mocks.signOut.mockRejectedValue(new Error("network"));
    await expect(signOutUser()).rejects.toThrow("network");
  });
});
