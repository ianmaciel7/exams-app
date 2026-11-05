import type { User } from "firebase/auth";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  auth: {
    currentUser: null as { uid: string; reload?: () => Promise<void> } | null,
  },
  onAuthStateChanged: vi.fn(),
}));
vi.mock("firebase/auth", () => ({
  onAuthStateChanged: mocks.onAuthStateChanged,
}));
vi.mock("@/lib/firebase/client", () => ({
  getFirebaseUI: () => ({ get: () => ({ auth: mocks.auth }) }),
}));

import {
  getActiveUser,
  getSessionUser,
  reloadSessionUser,
  setPendingSignOut,
  subscribeToSession,
} from "./session";

describe("getSessionUser", () => {
  it("returns the current user, or null without a session", () => {
    mocks.auth.currentUser = { uid: "u1" };
    expect(getSessionUser()).toBe(mocks.auth.currentUser);
    mocks.auth.currentUser = null;
    expect(getSessionUser()).toBeNull();
  });
});

describe("reloadSessionUser", () => {
  it("reloads the shared Firebase user after a server save", async () => {
    const reload = vi.fn(async () => {});
    mocks.auth.currentUser = { uid: "u1", reload };
    await reloadSessionUser();
    expect(reload).toHaveBeenCalledOnce();
  });

  it("rejects when there is no user to reload", async () => {
    mocks.auth.currentUser = null;
    await expect(reloadSessionUser()).rejects.toThrow("Authentication");
  });

  it("propagates reload failures without creating a new session", async () => {
    const reload = vi.fn().mockRejectedValue(new Error("network"));
    mocks.auth.currentUser = { uid: "u1", reload };
    await expect(reloadSessionUser()).rejects.toThrow("network");
    expect(getSessionUser()?.uid).toBe("u1");
  });
});

describe("subscribeToSession", () => {
  let emit: (user: User | null) => void;
  const stop = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    setPendingSignOut(null);
    mocks.onAuthStateChanged.mockImplementation(
      (_auth: unknown, callback: (user: User | null) => void) => {
        emit = callback;
        return stop;
      },
    );
  });

  it("forwards users and unsubscribes from Firebase", () => {
    const onChange = vi.fn();
    const user = { uid: "u1" } as User;
    const unsubscribe = subscribeToSession(onChange);
    expect(mocks.onAuthStateChanged).toHaveBeenCalledWith(
      mocks.auth,
      expect.any(Function),
    );

    emit(user);
    emit(null);
    expect(onChange).toHaveBeenNthCalledWith(1, user);
    expect(onChange).toHaveBeenNthCalledWith(2, null);

    unsubscribe();
    expect(stop).toHaveBeenCalledOnce();
  });

  it("holds sign-out until persistence completes", async () => {
    const onChange = vi.fn();
    subscribeToSession(onChange);
    const deferred = Promise.withResolvers<void>();
    setPendingSignOut(deferred.promise);

    emit(null);
    expect(onChange).not.toHaveBeenCalled();
    deferred.resolve();
    await deferred.promise;
    expect(onChange).toHaveBeenCalledExactlyOnceWith(null);
  });

  it("ignores a held sign-out once a newer session arrives", async () => {
    const onChange = vi.fn();
    const next = { uid: "u2" } as User;
    subscribeToSession(onChange);
    const deferred = Promise.withResolvers<void>();
    setPendingSignOut(deferred.promise);

    emit(null);
    emit(next);
    deferred.resolve();
    await deferred.promise;
    expect(onChange).toHaveBeenCalledExactlyOnceWith(next);
  });

  it("drops a held sign-out after unsubscribing", async () => {
    const onChange = vi.fn();
    const unsubscribe = subscribeToSession(onChange);
    const deferred = Promise.withResolvers<void>();
    setPendingSignOut(deferred.promise);

    emit(null);
    unsubscribe();
    deferred.resolve();
    await deferred.promise;
    expect(onChange).not.toHaveBeenCalled();
  });

  it("still settles when sign-out persistence fails", async () => {
    const onChange = vi.fn();
    subscribeToSession(onChange);
    setPendingSignOut(Promise.reject(new Error("x")));

    emit(null);
    await vi.waitFor(() => expect(onChange).toHaveBeenCalledWith(null));
  });
});

describe("getActiveUser", () => {
  const expected = { uid: "u1" } as User;

  it("returns the current user when the uid matches", () => {
    mocks.auth.currentUser = { uid: "u1" };
    expect(getActiveUser(expected)).toBe(mocks.auth.currentUser);
  });

  it("throws when there is no current user", () => {
    mocks.auth.currentUser = null;
    expect(() => getActiveUser(expected)).toThrow(
      "Authentication session unavailable",
    );
  });

  it("throws when the uid differs", () => {
    mocks.auth.currentUser = { uid: "other" };
    expect(() => getActiveUser(expected)).toThrow(
      "Authentication session unavailable",
    );
  });
});
