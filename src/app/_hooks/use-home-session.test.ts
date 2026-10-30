import { act, renderHook } from "@testing-library/react";
import type { User } from "firebase/auth";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getPendingSignOut: vi.fn(),
  subscribeToSession: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  getPendingSignOut: mocks.getPendingSignOut,
}));
vi.mock("@/lib/session", () => ({
  subscribeToSession: mocks.subscribeToSession,
}));

import { useHomeSession } from "./use-home-session";

describe("useHomeSession sign-out transition", () => {
  let notify: (user: User | null) => void;

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getPendingSignOut.mockReturnValue(null);
    mocks.subscribeToSession.mockImplementation(
      (callback: (user: User | null) => void) => {
        notify = callback;
        return () => {};
      },
    );
  });

  it("keeps authenticated navigation until sign-out persistence completes", async () => {
    const user = { uid: "user-1" } as User;
    const { result } = renderHook(() => useHomeSession());

    act(() => notify(user));
    expect(result.current.user).toBe(user);

    const deferred = Promise.withResolvers<void>();
    mocks.getPendingSignOut.mockReturnValue(deferred.promise);
    act(() => notify(null));
    expect(result.current.user).toBe(user);

    await act(async () => {
      deferred.resolve();
      await deferred.promise;
    });
    expect(result.current.user).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it("ignores a stale sign-out completion after a newer session arrives", async () => {
    const first = { uid: "user-1" } as User;
    const second = { uid: "user-2" } as User;
    const { result } = renderHook(() => useHomeSession());

    act(() => notify(first));
    const deferred = Promise.withResolvers<void>();
    mocks.getPendingSignOut.mockReturnValue(deferred.promise);
    act(() => notify(null));
    act(() => notify(second));

    await act(async () => {
      deferred.resolve();
      await deferred.promise;
    });
    expect(result.current.user).toBe(second);
  });
});
