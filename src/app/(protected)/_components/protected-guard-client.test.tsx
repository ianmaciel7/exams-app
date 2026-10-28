import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ProtectedGuardClient } from "./protected-guard-client";

const mocks = vi.hoisted(() => ({
  router: { replace: vi.fn() },
  subscribe: vi.fn(),
  getUI: vi.fn(),
  recordUsage: vi.fn(),
  currentUser: null as unknown,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => mocks.router,
  usePathname: () => "/profile",
}));

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock("firebase/auth", () => ({
  onAuthStateChanged: mocks.subscribe,
}));

vi.mock("@/lib/firebase/client", () => ({
  getFirebaseUI: mocks.getUI,
}));

vi.mock("@/lib/firebase/usage", () => ({ recordUsage: mocks.recordUsage }));

describe("ProtectedGuardClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.recordUsage.mockResolvedValue(undefined);
    mocks.getUI.mockReturnValue({
      get: () => ({
        auth: {
          get currentUser() {
            return mocks.currentUser;
          },
        },
      }),
    });
    mocks.subscribe.mockImplementation((_auth, callback) => {
      callback(mocks.currentUser);
      return () => {};
    });
  });

  afterEach(() => {
    cleanup();
    window.history.replaceState(null, "", "/");
  });

  it("renders loading indicator before auth resolves", () => {
    mocks.subscribe.mockReturnValue(() => {});
    render(
      <ProtectedGuardClient>
        <div>{"Protected Content"}</div>
      </ProtectedGuardClient>,
    );
    expect(screen.getByRole("status").textContent).toBe("loading");
    expect(screen.queryByText("Protected Content")).toBeNull();
  });

  it("redirects unauthenticated user to sign-in with return destination", () => {
    mocks.currentUser = null;
    window.history.replaceState(null, "", "/profile?tab=security");
    render(
      <ProtectedGuardClient>
        <div>{"Protected Content"}</div>
      </ProtectedGuardClient>,
    );
    expect(mocks.router.replace).toHaveBeenCalledWith(
      `/sign-in?next=${encodeURIComponent("/profile?tab=security")}`,
    );
    expect(screen.queryByText("Protected Content")).toBeNull();
  });

  it("renders children only after access is recorded", async () => {
    mocks.currentUser = { uid: "user-123" };
    render(
      <ProtectedGuardClient>
        <div>{"Protected Content"}</div>
      </ProtectedGuardClient>,
    );
    await waitFor(() =>
      expect(screen.getByText("Protected Content")).toBeTruthy(),
    );
    expect(mocks.recordUsage).toHaveBeenCalledWith({
      type: "screen_view",
      name: "/profile",
    });
  });

  it("blocks content when access logging fails", async () => {
    mocks.currentUser = { uid: "user-123" };
    mocks.recordUsage.mockRejectedValue(new Error("offline"));
    render(
      <ProtectedGuardClient>
        <div>{"Protected Content"}</div>
      </ProtectedGuardClient>,
    );
    await waitFor(() => expect(screen.getByRole("alert")).toBeTruthy());
    expect(screen.queryByText("Protected Content")).toBeNull();
  });

  it("ignores a logging acknowledgment after sign-out", async () => {
    let acknowledge: (() => void) | undefined;
    mocks.recordUsage.mockReturnValueOnce(
      new Promise<void>((resolve) => {
        acknowledge = resolve;
      }),
    );
    mocks.currentUser = { uid: "user-123" };
    render(
      <ProtectedGuardClient>
        <div>{"Protected Content"}</div>
      </ProtectedGuardClient>,
    );
    const onAuthChange = mocks.subscribe.mock.calls[0][1];
    await act(async () => {
      onAuthChange(null);
      acknowledge?.();
    });
    expect(screen.queryByText("Protected Content")).toBeNull();
    expect(mocks.router.replace).toHaveBeenCalled();
  });

  it("recovers from a committed logging error on a new session", async () => {
    let acknowledge: (() => void) | undefined;
    mocks.currentUser = { uid: "user-123" };
    mocks.recordUsage
      .mockRejectedValueOnce(new Error("offline"))
      .mockReturnValueOnce(
        new Promise<void>((resolve) => {
          acknowledge = resolve;
        }),
      );
    render(<ProtectedGuardClient>{"Protected Content"}</ProtectedGuardClient>);
    await screen.findByRole("alert");

    await act(async () => {
      mocks.subscribe.mock.calls[0][1]({ uid: "user-456" });
    });
    expect(screen.queryByRole("alert")).toBeNull();
    expect(screen.getByRole("status")).toBeTruthy();
    expect(screen.queryByText("Protected Content")).toBeNull();

    await act(async () => acknowledge?.());
    expect(screen.getByText("Protected Content")).toBeTruthy();
  });

  it("ignores an obsolete logging failure after a newer session succeeds", async () => {
    let rejectOld: ((cause: Error) => void) | undefined;
    mocks.recordUsage.mockReturnValueOnce(
      new Promise<void>((_resolve, reject) => {
        rejectOld = reject;
      }),
    );
    mocks.currentUser = { uid: "user-123" };
    render(
      <ProtectedGuardClient>
        <div>{"Protected Content"}</div>
      </ProtectedGuardClient>,
    );
    const onAuthChange = mocks.subscribe.mock.calls[0][1];
    await act(async () => {
      onAuthChange({ uid: "user-456" });
    });
    await waitFor(() =>
      expect(screen.getByText("Protected Content")).toBeTruthy(),
    );
    await act(async () => {
      rejectOld?.(new Error("obsolete request"));
    });
    expect(screen.queryByRole("alert")).toBeNull();
    expect(screen.getByText("Protected Content")).toBeTruthy();
  });

  it("shows configuration error when getFirebaseUI throws", () => {
    mocks.getUI.mockImplementation(() => {
      throw new Error("missing config");
    });
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    render(
      <ProtectedGuardClient>
        <div>{"Protected Content"}</div>
      </ProtectedGuardClient>,
    );
    expect(screen.getByRole("alert").textContent).toBe("configurationError");
    log.mockRestore();
  });
});
