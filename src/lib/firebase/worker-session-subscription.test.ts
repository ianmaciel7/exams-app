import type { User } from "firebase/auth";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ subscribeToAuth: vi.fn() }));
vi.mock("@/lib/firebase/client", () => ({
  subscribeToAuth: mocks.subscribeToAuth,
}));

import { subscribeToWorkerSession } from "./worker-session-subscription";

describe("subscribeToWorkerSession", () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it("reports a settled user and the signed-out state", () => {
    let notify: (user: User | null) => void = () => {};
    const unsubscribe = vi.fn();
    mocks.subscribeToAuth.mockImplementation((listener) => {
      notify = listener;
      return unsubscribe;
    });
    const onChange = vi.fn();

    const stop = subscribeToWorkerSession(onChange);
    notify({ uid: "u1" } as User);
    notify(null);
    expect(onChange).toHaveBeenNthCalledWith(1, "u1");
    expect(onChange).toHaveBeenNthCalledWith(2, null);

    stop();
    expect(unsubscribe).toHaveBeenCalledOnce();
  });

  it("does not let optional worker setup override auth configuration errors", () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    mocks.subscribeToAuth.mockImplementation(() => {
      throw new Error("missing Firebase configuration");
    });
    const onChange = vi.fn();

    expect(() => subscribeToWorkerSession(onChange)()).not.toThrow();
    expect(onChange).not.toHaveBeenCalled();
    expect(consoleError).toHaveBeenCalledOnce();
  });
});
