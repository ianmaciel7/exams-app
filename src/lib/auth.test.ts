import type { User } from "firebase/auth";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  auth: { id: "auth", currentUser: null as User | null },
  signOut: vi.fn(),
  verifyEmail: vi.fn(),
  trackEvent: vi.fn(),
}));

vi.mock("firebase/auth", () => ({
  signOut: mocks.signOut,
  verifyBeforeUpdateEmail: mocks.verifyEmail,
}));
vi.mock("@/lib/firebase/usage", () => ({ trackEvent: mocks.trackEvent }));
vi.mock("@/lib/firebase/client", () => ({
  getFirebaseUI: () => ({ get: () => ({ auth: mocks.auth }) }),
}));

import { sendEmailChangeVerification, signOutUser } from "./auth";
import { getPendingSignOut } from "./session";

describe("sendEmailChangeVerification", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.auth.currentUser = { uid: "user-1" } as User;
    mocks.trackEvent.mockReset().mockResolvedValue(undefined);
    mocks.verifyEmail.mockReset().mockResolvedValue(undefined);
  });

  it("waits for telemetry before asking Firebase to verify the new address", async () => {
    const telemetry = Promise.withResolvers<void>();
    mocks.trackEvent.mockReturnValue(telemetry.promise);
    const pending = sendEmailChangeVerification("new@example.com");
    expect(mocks.trackEvent).toHaveBeenCalledWith({
      type: "function_use",
      name: "profile.update",
    });
    expect(mocks.verifyEmail).not.toHaveBeenCalled();
    telemetry.resolve();
    await pending;
    expect(mocks.verifyEmail).toHaveBeenCalledExactlyOnceWith(
      mocks.auth.currentUser,
      "new@example.com",
    );
  });

  it("rejects a missing session before sending telemetry or verification", async () => {
    mocks.auth.currentUser = null;
    await expect(
      sendEmailChangeVerification("new@example.com"),
    ).rejects.toThrow("Authentication");
    expect(mocks.trackEvent).not.toHaveBeenCalled();
    expect(mocks.verifyEmail).not.toHaveBeenCalled();
  });

  it("preserves the telemetry failure policy without sending verification", async () => {
    mocks.trackEvent.mockRejectedValue(new Error("offline"));
    await expect(
      sendEmailChangeVerification("new@example.com"),
    ).rejects.toThrow("offline");
    expect(mocks.verifyEmail).not.toHaveBeenCalled();
  });

  it("rejects an account switch while telemetry is pending", async () => {
    const telemetry = Promise.withResolvers<void>();
    mocks.trackEvent.mockReturnValue(telemetry.promise);
    const pending = sendEmailChangeVerification("new@example.com");
    mocks.auth.currentUser = { uid: "other-user" } as User;
    telemetry.resolve();
    await expect(pending).rejects.toThrow("Authentication");
    expect(mocks.verifyEmail).not.toHaveBeenCalled();
  });

  it("propagates verification failures for localized dialog feedback", async () => {
    mocks.verifyEmail.mockRejectedValue(new Error("recent-login-required"));
    await expect(
      sendEmailChangeVerification("new@example.com"),
    ).rejects.toThrow("recent-login-required");
  });
});

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

  it("shares one persistence promise across concurrent sign-outs", async () => {
    const deferred = Promise.withResolvers<void>();
    mocks.signOut.mockReturnValue(deferred.promise);
    const first = signOutUser();
    const second = signOutUser();
    expect(second).toBe(first);
    expect(mocks.signOut).toHaveBeenCalledOnce();
    deferred.resolve();
    await first;
    expect(getPendingSignOut()).toBeNull();
  });
});
