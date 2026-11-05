import { enUs, esEs, ptBr } from "@firebase-oss/ui-translations";
import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PublicGuardClient } from "./public-guard-client";

const mocks = vi.hoisted(() => ({
  router: { replace: vi.fn() },
  subscribe: vi.fn(),
  setLocale: vi.fn(),
  getUI: vi.fn(),
  unsubscribe: vi.fn(),
  syncSessionCookie: vi.fn(),
  locale: "pt-BR",
}));
vi.mock("next/navigation", () => ({
  useRouter: () => mocks.router,
}));
vi.mock("next-intl", () => ({
  useLocale: () => mocks.locale,
  useTranslations: () => (key: string) => key,
}));
vi.mock("@/lib/auth", () => ({
  getPendingSignOut: () => null,
  syncSessionCookie: mocks.syncSessionCookie,
}));
vi.mock("firebase/auth", () => ({ onAuthStateChanged: mocks.subscribe }));
vi.mock("@/lib/firebase/client", () => ({ getFirebaseUI: mocks.getUI }));
vi.mock("@firebase-oss/ui-react", () => ({
  FirebaseUIProvider: ({ children }: { children: React.ReactNode }) => children,
}));

describe("PublicGuardClient", () => {
  afterEach(() => {
    cleanup();
    window.history.replaceState(null, "", "/");
  });
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.locale = "pt-BR";
    mocks.getUI.mockReturnValue({
      get: () => ({ auth: {}, setLocale: mocks.setLocale }),
    });
    mocks.subscribe.mockReturnValue(mocks.unsubscribe);
    mocks.syncSessionCookie.mockResolvedValue(undefined);
  });

  it("waits for the first auth state and renders the screen for a signed-out user", () => {
    render(
      <PublicGuardClient>
        <p>{"Screen"}</p>
      </PublicGuardClient>,
    );
    expect(
      document.querySelector('[data-slot="loading-status"]'),
    ).not.toBeNull();
    expect(screen.queryByText("Screen")).toBeNull();
    expect(mocks.setLocale).toHaveBeenCalled();
    act(() => mocks.subscribe.mock.calls[0][1](null));
    expect(screen.getByText("Screen")).toBeTruthy();
  });

  it("creates the session cookie before leaving the sign-in screen", async () => {
    let finishSync: () => void = () => undefined;
    mocks.syncSessionCookie.mockReturnValue(
      new Promise<void>((resolve) => {
        finishSync = resolve;
      }),
    );
    render(
      <PublicGuardClient>
        <p>{"Screen"}</p>
      </PublicGuardClient>,
    );
    const user = { uid: "user" };
    act(() => mocks.subscribe.mock.calls[0][1](user));
    expect(mocks.syncSessionCookie).toHaveBeenCalledWith(user);
    expect(mocks.router.replace).not.toHaveBeenCalled();
    finishSync();
    await waitFor(() => expect(mocks.router.replace).toHaveBeenCalledWith("/"));
  });

  it("does not navigate after the screen is left while the cookie is pending", async () => {
    let finishSync: () => void = () => undefined;
    mocks.syncSessionCookie.mockReturnValue(
      new Promise<void>((resolve) => {
        finishSync = resolve;
      }),
    );
    const { unmount } = render(
      <PublicGuardClient>
        <p>{"Screen"}</p>
      </PublicGuardClient>,
    );
    act(() => mocks.subscribe.mock.calls[0][1]({ uid: "user" }));
    unmount();
    finishSync();
    await Promise.resolve();
    expect(mocks.router.replace).not.toHaveBeenCalled();
  });

  it("redirects a signed-in user without displaying the screen", async () => {
    render(
      <PublicGuardClient>
        <p>{"Screen"}</p>
      </PublicGuardClient>,
    );
    act(() => mocks.subscribe.mock.calls[0][1]({ uid: "user" }));
    await waitFor(() => expect(mocks.router.replace).toHaveBeenCalledWith("/"));
    expect(screen.queryByText("Screen")).toBeNull();
  });

  it("syncs locale changes without recreating the store or subscription", () => {
    const view = render(<PublicGuardClient>{"Screen"}</PublicGuardClient>);
    expect(mocks.setLocale).toHaveBeenLastCalledWith(ptBr);
    mocks.locale = "es";
    view.rerender(<PublicGuardClient>{"Screen"}</PublicGuardClient>);
    expect(mocks.setLocale).toHaveBeenLastCalledWith(esEs);
    mocks.locale = "unsupported";
    view.rerender(<PublicGuardClient>{"Screen"}</PublicGuardClient>);
    expect(mocks.setLocale).toHaveBeenLastCalledWith(enUs);
    expect(mocks.subscribe).toHaveBeenCalledOnce();
  });

  it("unsubscribes and ignores session callbacks after unmount", () => {
    const view = render(<PublicGuardClient>{"Screen"}</PublicGuardClient>);
    const onSession = mocks.subscribe.mock.calls[0][1];
    view.unmount();
    expect(mocks.unsubscribe).toHaveBeenCalledOnce();
    act(() => onSession({ uid: "late-user" }));
    expect(mocks.router.replace).not.toHaveBeenCalled();
  });

  it("shows a configuration error", () => {
    mocks.getUI.mockImplementation(() => {
      throw new Error("missing configuration");
    });
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    render(
      <PublicGuardClient>
        <p>{"Screen"}</p>
      </PublicGuardClient>,
    );
    expect(screen.getByRole("alert").textContent).toBe("configurationError");
    log.mockRestore();
  });

  it.each([
    ["/profile?tab=security", "/profile?tab=security"],
    ["https://evil.example", "/"],
    ["/sign-in", "/"],
  ])(
    "redirects safely after sign-in with next=%s",
    async (next, destination) => {
      window.history.replaceState(
        null,
        "",
        `/sign-in?next=${encodeURIComponent(next)}`,
      );
      render(
        <PublicGuardClient>
          <p>{"Screen"}</p>
        </PublicGuardClient>,
      );
      act(() => mocks.subscribe.mock.calls[0][1]({ uid: "user" }));
      await waitFor(() =>
        expect(mocks.router.replace).toHaveBeenCalledWith(destination),
      );
      expect(screen.queryByText("Screen")).toBeNull();
    },
  );
});
