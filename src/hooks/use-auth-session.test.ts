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

import { useAuthSession } from "./use-auth-session";

describe("useAuthSession sign-out transition", () => {
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
    const { result } = renderHook(() => useAuthSession());

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
    const { result } = renderHook(() => useAuthSession());

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

  it("moves from loading to one explicit session state", () => {
    const { result } = renderHook(() => useAuthSession());
    expect(result.current).toEqual({
      isError: false,
      isLoading: true,
      user: null,
    });

    const user = { uid: "user-1" } as User;
    act(() => notify(user));
    expect(result.current).toEqual({
      isError: false,
      isLoading: false,
      user,
    });

    act(() => notify(null));
    expect(result.current).toEqual({
      isError: false,
      isLoading: false,
      user: null,
    });
  });

  it("reports a failed subscription as an error, not as a signed-out visitor", () => {
    mocks.subscribeToSession.mockImplementation(() => {
      throw new Error("missing config");
    });
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    const { result } = renderHook(() => useAuthSession());
    expect(result.current).toEqual({
      isError: true,
      isLoading: false,
      user: null,
    });
    log.mockRestore();
  });

  it("unsubscribes and ignores a sign-out that settles after unmount", async () => {
    const unsubscribe = vi.fn();
    mocks.subscribeToSession.mockImplementation(
      (callback: (user: User | null) => void) => {
        notify = callback;
        return unsubscribe;
      },
    );
    const { result, unmount } = renderHook(() => useAuthSession());
    const deferred = Promise.withResolvers<void>();
    mocks.getPendingSignOut.mockReturnValue(deferred.promise);
    act(() => notify(null));
    unmount();
    deferred.resolve();
    await deferred.promise;
    expect(unsubscribe).toHaveBeenCalledOnce();
    expect(result.current.isLoading).toBe(true);
  });
});
