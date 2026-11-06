import { act, renderHook } from "@testing-library/react";
import type { User } from "firebase/auth";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  subscribeToAuth: vi.fn(),
  syncSessionCookie: vi.fn(),
  signOutUser: vi.fn(),
  currentUser: null as User | null,
}));

vi.mock("@/lib/firebase/client", () => ({
  subscribeToAuth: mocks.subscribeToAuth,
  getFirebaseAuthUser: () => mocks.currentUser,
}));

vi.mock("@/lib/auth", () => ({
  syncSessionCookie: mocks.syncSessionCookie,
  signOutUser: mocks.signOutUser,
}));

import { useSessionProviderClient } from "./use-session-provider-client";

/** Firebase loads on demand, so wait for the hook to subscribe. */
async function renderSubscribed() {
  const rendered = renderHook(() => useSessionProviderClient());
  await vi.waitFor(() => expect(mocks.subscribeToAuth).toHaveBeenCalled());
  return rendered;
}

describe("useSessionProviderClient", () => {
  let notify: (user: User | null) => void;

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.currentUser = null;
    mocks.syncSessionCookie.mockReset().mockResolvedValue(true);
    mocks.signOutUser.mockResolvedValue(undefined);
    mocks.subscribeToAuth.mockImplementation(
      (callback: (user: User | null) => void) => {
        notify = callback;
        return () => {};
      },
    );
  });

  it("moves from loading to one explicit session state", async () => {
    const { result } = renderHook(() => useSessionProviderClient());
    expect(result.current).toEqual({
      isError: false,
      isLoading: true,
      user: null,
    });
    await vi.waitFor(() => expect(mocks.subscribeToAuth).toHaveBeenCalled());

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

  it("clears stale server credentials when refresh has already removed the browser user", async () => {
    mocks.syncSessionCookie.mockResolvedValue(false);
    await renderSubscribed();
    act(() =>
      notify({ uid: "revoked", getIdToken: vi.fn() } as unknown as User),
    );
    await vi.waitFor(() => expect(mocks.signOutUser).toHaveBeenCalledOnce());
  });

  it("does not sign out a newer account when an old exchange fails late", async () => {
    const pending = Promise.withResolvers<boolean>();
    mocks.syncSessionCookie.mockReturnValue(pending.promise);
    await renderSubscribed();
    act(() => notify({ uid: "old", getIdToken: vi.fn() } as unknown as User));
    mocks.currentUser = { uid: "new" } as User;
    await act(async () => pending.resolve(false));
    expect(mocks.signOutUser).not.toHaveBeenCalled();
  });

  it("reports a failed subscription as an error, not as a signed-out visitor", async () => {
    mocks.subscribeToAuth.mockImplementation(() => {
      throw new Error("missing config");
    });
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    const { result } = renderHook(() => useSessionProviderClient());
    await vi.waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current).toEqual({
      isError: true,
      isLoading: false,
      user: null,
    });
    log.mockRestore();
  });

  it("unsubscribes on unmount and ignores a subscription that resolves late", async () => {
    const unsubscribe = vi.fn();
    mocks.subscribeToAuth.mockImplementation(() => unsubscribe);
    const { unmount } = await renderSubscribed();
    unmount();
    expect(unsubscribe).toHaveBeenCalledOnce();
  });
});
