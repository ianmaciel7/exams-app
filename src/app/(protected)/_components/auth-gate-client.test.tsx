import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { StrictMode, useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useAuthenticatedUser } from "../_hooks/use-authenticated-user";
import { AuthGateClient } from "./auth-gate-client";

const mocks = vi.hoisted(() => ({
  router: { replace: vi.fn() },
  subscribe: vi.fn(),
  unsubscribe: vi.fn(),
  getUI: vi.fn(),
  pendingSignOut: null as Promise<void> | null,
}));

vi.mock("next/navigation", () => ({ useRouter: () => mocks.router }));
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));
vi.mock("firebase/auth", () => ({ onAuthStateChanged: mocks.subscribe }));
vi.mock("@/lib/firebase/client", () => ({ getFirebaseUI: mocks.getUI }));
vi.mock("@/lib/auth", () => ({
  getPendingSignOut: () => mocks.pendingSignOut,
}));

function ProtectedContent() {
  const { uid } = useAuthenticatedUser();
  return <div>{`Protected Content ${uid}`}</div>;
}

function emit(user: { uid: string } | null) {
  act(() => mocks.subscribe.mock.calls[0][1](user));
}

function renderGate() {
  return render(
    <AuthGateClient>
      <ProtectedContent />
    </AuthGateClient>,
  );
}

describe("AuthGateClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.pendingSignOut = null;
    mocks.getUI.mockReturnValue({ get: () => ({ auth: {} }) });
    mocks.subscribe.mockReturnValue(mocks.unsubscribe);
  });

  afterEach(() => {
    cleanup();
    window.history.replaceState(null, "", "/");
  });

  it("renders a loading indicator before auth resolves", () => {
    renderGate();
    expect(screen.getByRole("status").textContent).toBe("loading");
    expect(screen.queryByText(/Protected Content/)).toBeNull();
    expect(mocks.router.replace).not.toHaveBeenCalled();
  });

  it("redirects once with the return destination, including the query", () => {
    window.history.replaceState(null, "", "/profile?tab=security");
    renderGate();
    emit(null);
    emit(null);
    expect(mocks.router.replace).toHaveBeenCalledOnce();
    expect(mocks.router.replace).toHaveBeenCalledWith(
      `/sign-in?next=${encodeURIComponent("/profile?tab=security")}`,
    );
    expect(screen.queryByText(/Protected Content/)).toBeNull();
    expect(screen.getByRole("status")).toBeTruthy();
  });

  it("provides the authenticated user to its subtree", () => {
    renderGate();
    emit({ uid: "user-123" });
    expect(screen.getByText("Protected Content user-123")).toBeTruthy();
  });

  it("hides protected content as soon as the session ends", () => {
    renderGate();
    emit({ uid: "user-123" });
    emit(null);
    expect(screen.queryByText(/Protected Content/)).toBeNull();
    expect(mocks.router.replace).toHaveBeenCalledOnce();
  });

  it("does not redirect until a pending sign-out has settled", async () => {
    renderGate();
    emit({ uid: "user-123" });
    const deferred = Promise.withResolvers<void>();
    mocks.pendingSignOut = deferred.promise;
    emit(null);
    expect(mocks.router.replace).not.toHaveBeenCalled();
    await act(async () => {
      deferred.resolve();
      await deferred.promise;
    });
    expect(mocks.router.replace).toHaveBeenCalledOnce();
  });

  it("remounts the subtree when the account changes", () => {
    function RetainedState() {
      const { uid } = useAuthenticatedUser();
      const [initialUid] = useState(uid);
      return <div>{initialUid}</div>;
    }
    render(
      <AuthGateClient>
        <RetainedState />
      </AuthGateClient>,
    );
    emit({ uid: "user-a" });
    emit({ uid: "user-b" });
    expect(screen.getByText("user-b")).toBeTruthy();
    expect(screen.queryByText("user-a")).toBeNull();
  });

  it("offers recovery when Firebase cannot initialize", () => {
    mocks.getUI.mockImplementation(() => {
      throw new Error("missing config");
    });
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    const reload = vi.fn();
    vi.stubGlobal("location", { ...window.location, reload });
    renderGate();
    expect(screen.getByRole("alert").textContent).toBe("configurationError");
    expect(screen.queryByRole("status")).toBeNull();
    expect(mocks.router.replace).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "tryAgain" }));
    expect(reload).toHaveBeenCalledOnce();
    vi.unstubAllGlobals();
    log.mockRestore();
  });

  it("does not treat a subscription failure as a signed-out visitor", () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    renderGate();
    act(() => mocks.subscribe.mock.calls[0][2](new Error("network")));
    expect(screen.getByRole("alert").textContent).toBe("configurationError");
    expect(mocks.router.replace).not.toHaveBeenCalled();
    log.mockRestore();
  });

  it("leaves no active subscription behind under Strict Mode", () => {
    const { unmount } = render(
      <StrictMode>
        <AuthGateClient>
          <ProtectedContent />
        </AuthGateClient>
      </StrictMode>,
    );
    unmount();
    expect(mocks.unsubscribe).toHaveBeenCalledTimes(
      mocks.subscribe.mock.calls.length,
    );
  });
});
