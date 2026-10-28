import type { User } from "firebase/auth";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  auth: { currentUser: null as { uid: string } | null },
  onAuthStateChanged: vi.fn(),
}));

vi.mock("firebase/auth", () => ({
  onAuthStateChanged: mocks.onAuthStateChanged,
}));
vi.mock("@/lib/firebase/client", () => ({
  getFirebaseUI: () => ({ get: () => ({ auth: mocks.auth }) }),
}));

import { getActiveUser, getSessionUser, subscribeToSession } from "./session";

describe("getSessionUser", () => {
  it("returns the current user, or null without a session", () => {
    mocks.auth.currentUser = { uid: "u1" };
    expect(getSessionUser()).toBe(mocks.auth.currentUser);
    mocks.auth.currentUser = null;
    expect(getSessionUser()).toBeNull();
  });
});

describe("subscribeToSession", () => {
  beforeEach(() => vi.clearAllMocks());

  it("forwards callbacks and returns the unsubscribe function", () => {
    const unsubscribe = vi.fn();
    mocks.onAuthStateChanged.mockReturnValue(unsubscribe);
    const onChange = vi.fn();
    const onError = vi.fn();

    expect(subscribeToSession(onChange, onError)).toBe(unsubscribe);
    expect(mocks.onAuthStateChanged).toHaveBeenCalledWith(
      mocks.auth,
      onChange,
      onError,
    );
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
