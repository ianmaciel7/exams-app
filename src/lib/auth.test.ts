import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  auth: { id: "auth" },
  signOut: vi.fn(),
  verifyBeforeUpdateEmail: vi.fn(),
  trackEvent: vi.fn(),
  getSessionUser: vi.fn(),
}));

vi.mock("firebase/auth", () => ({
  signOut: mocks.signOut,
  verifyBeforeUpdateEmail: mocks.verifyBeforeUpdateEmail,
}));
vi.mock("@/lib/firebase/usage", () => ({ trackEvent: mocks.trackEvent }));
vi.mock("@/lib/session", () => ({ getSessionUser: mocks.getSessionUser }));
vi.mock("@/lib/firebase/client", () => ({
  getFirebaseUI: () => ({ get: () => ({ auth: mocks.auth }) }),
}));

import {
  getPendingSignOut,
  sendEmailChangeVerification,
  signOutUser,
} from "./auth";

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

describe("sendEmailChangeVerification", () => {
  const user = { uid: "u1" };
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getSessionUser.mockReturnValue(user);
    mocks.trackEvent.mockReset().mockResolvedValue(undefined);
    mocks.verifyBeforeUpdateEmail.mockReset().mockResolvedValue(undefined);
  });

  it("waits for telemetry before sending verification", async () => {
    const deferred = Promise.withResolvers<void>();
    mocks.trackEvent.mockReturnValue(deferred.promise);
    const result = sendEmailChangeVerification("new@example.com");
    expect(mocks.trackEvent).toHaveBeenCalledExactlyOnceWith({
      type: "function_use",
      name: "profile.update",
    });
    expect(mocks.verifyBeforeUpdateEmail).not.toHaveBeenCalled();
    deferred.resolve();
    await result;
    expect(mocks.verifyBeforeUpdateEmail).toHaveBeenCalledExactlyOnceWith(
      user,
      "new@example.com",
    );
  });

  it("rejects without a session before tracking or sending", async () => {
    mocks.getSessionUser.mockReturnValue(null);
    await expect(
      sendEmailChangeVerification("new@example.com"),
    ).rejects.toThrow("Authentication session unavailable");
    expect(mocks.trackEvent).not.toHaveBeenCalled();
    expect(mocks.verifyBeforeUpdateEmail).not.toHaveBeenCalled();
  });

  it("does not send verification when telemetry fails", async () => {
    mocks.trackEvent.mockRejectedValue(new Error("offline"));
    await expect(
      sendEmailChangeVerification("new@example.com"),
    ).rejects.toThrow("offline");
    expect(mocks.verifyBeforeUpdateEmail).not.toHaveBeenCalled();
  });

  it("propagates Firebase verification failures for retry", async () => {
    mocks.verifyBeforeUpdateEmail.mockRejectedValue(
      new Error("requires-recent-login"),
    );
    await expect(
      sendEmailChangeVerification("new@example.com"),
    ).rejects.toThrow("requires-recent-login");
  });
});
