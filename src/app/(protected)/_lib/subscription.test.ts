import type { User } from "firebase/auth";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { subscribeToSession } from "@/lib/session";
import { subscribeToProtectedSession } from "./subscription";

vi.mock("@/lib/session", () => ({
  subscribeToSession: vi.fn(),
}));

describe("subscribeToProtectedSession", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("notifies onAuthenticated with user uid when session emits a user", () => {
    let authCallback: ((user: User | null) => void) | undefined;
    vi.mocked(subscribeToSession).mockImplementation((onChange) => {
      authCallback = onChange;
      return () => {};
    });

    const onAuthenticated = vi.fn();
    const onUnauthenticated = vi.fn();

    subscribeToProtectedSession({ onAuthenticated, onUnauthenticated });

    authCallback?.({ uid: "user-abc" } as User);

    expect(onAuthenticated).toHaveBeenCalledWith("user-abc");
    expect(onUnauthenticated).not.toHaveBeenCalled();
  });

  it("deduplicates consecutive authenticated emissions for the same user", () => {
    let authCallback: ((user: User | null) => void) | undefined;
    vi.mocked(subscribeToSession).mockImplementation((onChange) => {
      authCallback = onChange;
      return () => {};
    });

    const onAuthenticated = vi.fn();
    const onUnauthenticated = vi.fn();

    subscribeToProtectedSession({ onAuthenticated, onUnauthenticated });

    authCallback?.({ uid: "user-abc" } as User);
    authCallback?.({ uid: "user-abc" } as User);

    expect(onAuthenticated).toHaveBeenCalledTimes(1);
  });

  it("notifies onUnauthenticated when session emits null", () => {
    let authCallback: ((user: User | null) => void) | undefined;
    vi.mocked(subscribeToSession).mockImplementation((onChange) => {
      authCallback = onChange;
      return () => {};
    });

    const onAuthenticated = vi.fn();
    const onUnauthenticated = vi.fn();

    subscribeToProtectedSession({ onAuthenticated, onUnauthenticated });

    authCallback?.(null);

    expect(onUnauthenticated).toHaveBeenCalledTimes(1);
    expect(onAuthenticated).not.toHaveBeenCalled();
  });

  it("deduplicates consecutive unauthenticated emissions", () => {
    let authCallback: ((user: User | null) => void) | undefined;
    vi.mocked(subscribeToSession).mockImplementation((onChange) => {
      authCallback = onChange;
      return () => {};
    });

    const onAuthenticated = vi.fn();
    const onUnauthenticated = vi.fn();

    subscribeToProtectedSession({ onAuthenticated, onUnauthenticated });

    authCallback?.(null);
    authCallback?.(null);

    expect(onUnauthenticated).toHaveBeenCalledTimes(1);
  });

  it("forwards error to onError when subscription errors", () => {
    let errorCallback: ((error: Error) => void) | undefined;
    vi.mocked(subscribeToSession).mockImplementation((_onChange, onError) => {
      errorCallback = onError;
      return () => {};
    });

    const onAuthenticated = vi.fn();
    const onUnauthenticated = vi.fn();
    const onError = vi.fn();

    subscribeToProtectedSession({
      onAuthenticated,
      onUnauthenticated,
      onError,
    });

    const testError = new Error("Auth service failure");
    errorCallback?.(testError);

    expect(onError).toHaveBeenCalledWith(testError);
  });

  it("ignores emissions after cleanup", () => {
    let authCallback: ((user: User | null) => void) | undefined;
    const unsubscribeSession = vi.fn();
    vi.mocked(subscribeToSession).mockImplementation((onChange) => {
      authCallback = onChange;
      return unsubscribeSession;
    });

    const onAuthenticated = vi.fn();
    const onUnauthenticated = vi.fn();

    const unsubscribe = subscribeToProtectedSession({
      onAuthenticated,
      onUnauthenticated,
    });

    unsubscribe();
    expect(unsubscribeSession).toHaveBeenCalled();

    authCallback?.({ uid: "user-abc" } as User);
    expect(onAuthenticated).not.toHaveBeenCalled();
  });
});
