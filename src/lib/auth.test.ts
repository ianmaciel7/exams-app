import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  auth: { id: "auth" },
  signOut: vi.fn(),
}));

vi.mock("firebase/auth", () => ({ signOut: mocks.signOut }));
vi.mock("@/lib/firebase/client", () => ({
  getFirebaseUI: () => ({ get: () => ({ auth: mocks.auth }) }),
}));

import { getPendingSignOut, signOutUser } from "./auth";

describe("signOutUser", () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.unstubAllGlobals());

  it("signs out of the shared Auth instance", async () => {
    mocks.signOut.mockResolvedValue(undefined);
    await signOutUser();
    expect(mocks.signOut).toHaveBeenCalledWith(mocks.auth);
  });

  it("does not release the sign-out barrier until persistence settles", async () => {
    const deferred = Promise.withResolvers<void>();
    mocks.signOut.mockReturnValue(deferred.promise);

    const signOutPromise = signOutUser();
    expect(getPendingSignOut()).toBe(signOutPromise);

    deferred.resolve();
    await signOutPromise;
    await vi.waitFor(() => expect(getPendingSignOut()).toBeNull());
  });

  it("waits for the worker to acknowledge logout before completing", async () => {
    let acknowledge = () => {};
    class FakeMessageChannel {
      port1 = {
        onmessage: null as ((event: { data: { type: string } }) => void) | null,
        close: vi.fn(),
      };
      port2 = { close: vi.fn() };

      constructor() {
        acknowledge = () => {
          this.port1.onmessage?.({
            data: { type: "firebase-auth-session-ack" },
          });
        };
      }
    }
    const postMessage = vi.fn();
    vi.stubGlobal("MessageChannel", FakeMessageChannel);
    vi.stubGlobal("navigator", {
      serviceWorker: { controller: { postMessage } },
    });
    mocks.signOut.mockResolvedValue(undefined);

    const pending = signOutUser();
    await vi.waitFor(() => expect(postMessage).toHaveBeenCalledOnce());
    expect(postMessage).toHaveBeenCalledWith(
      { type: "firebase-auth-session", uid: null },
      [expect.anything()],
    );
    expect(getPendingSignOut()).toBe(pending);

    let settled = false;
    void pending.then(() => {
      settled = true;
    });
    await Promise.resolve();
    expect(settled).toBe(false);

    acknowledge();
    await pending;
    await vi.waitFor(() => expect(getPendingSignOut()).toBeNull());
  });

  it("propagates sign-out failures", async () => {
    mocks.signOut.mockRejectedValue(new Error("network"));
    await expect(signOutUser()).rejects.toThrow("network");
  });
});
