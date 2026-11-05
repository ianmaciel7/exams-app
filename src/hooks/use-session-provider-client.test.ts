import { act, renderHook } from "@testing-library/react";
import type { User } from "firebase/auth";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  subscribeToAuth: vi.fn(),
}));

vi.mock("@/lib/firebase/client", () => ({
  subscribeToAuth: mocks.subscribeToAuth,
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
