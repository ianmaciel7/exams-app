import { enUs, esEs, ptBr } from "@firebase-oss/ui-translations";
import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AuthProviderClient } from "./auth-provider-client";

const mocks = vi.hoisted(() => ({
  router: { replace: vi.fn() },
  subscribe: vi.fn(),
  setLocale: vi.fn(),
  getUI: vi.fn(),
  unsubscribe: vi.fn(),
  locale: "pt-BR",
}));
vi.mock("next/navigation", () => ({
  useRouter: () => mocks.router,
}));
vi.mock("next-intl", () => ({
  useLocale: () => mocks.locale,
  useTranslations: () => (key: string) => key,
}));
vi.mock("firebase/auth", () => ({ onAuthStateChanged: mocks.subscribe }));
vi.mock("@/lib/firebase/client", () => ({ getFirebaseUI: mocks.getUI }));
vi.mock("@firebase-oss/ui-react", () => ({
  FirebaseUIProvider: ({ children }: { children: React.ReactNode }) => children,
}));

describe("AuthProviderClient", () => {
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
  });

  it("waits for the first auth state and renders the screen for a signed-out user", () => {
    render(
      <AuthProviderClient>
        <p>{"Screen"}</p>
      </AuthProviderClient>,
    );
    expect(screen.getByRole("status")).toBeTruthy();
    expect(screen.queryByText("Screen")).toBeNull();
    expect(mocks.setLocale).toHaveBeenCalled();
    act(() => mocks.subscribe.mock.calls[0][1](null));
    expect(screen.getByText("Screen")).toBeTruthy();
  });

  it("redirects a signed-in user without displaying the screen", () => {
    render(
      <AuthProviderClient>
        <p>{"Screen"}</p>
      </AuthProviderClient>,
    );
    act(() => mocks.subscribe.mock.calls[0][1]({ uid: "user" }));
    expect(mocks.router.replace).toHaveBeenCalledWith("/");
    expect(screen.queryByText("Screen")).toBeNull();
  });

  it("syncs locale changes without recreating the store or subscription", () => {
    const view = render(<AuthProviderClient>{"Screen"}</AuthProviderClient>);
    expect(mocks.setLocale).toHaveBeenLastCalledWith(ptBr);
    mocks.locale = "es";
    view.rerender(<AuthProviderClient>{"Screen"}</AuthProviderClient>);
    expect(mocks.setLocale).toHaveBeenLastCalledWith(esEs);
    mocks.locale = "unsupported";
    view.rerender(<AuthProviderClient>{"Screen"}</AuthProviderClient>);
    expect(mocks.setLocale).toHaveBeenLastCalledWith(enUs);
    expect(mocks.subscribe).toHaveBeenCalledOnce();
  });

  it("unsubscribes and ignores session callbacks after unmount", () => {
    const view = render(<AuthProviderClient>{"Screen"}</AuthProviderClient>);
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
      <AuthProviderClient>
        <p>{"Screen"}</p>
      </AuthProviderClient>,
    );
    expect(screen.getByRole("alert").textContent).toBe("configurationError");
    log.mockRestore();
  });

  it.each([
    ["/profile?tab=security", "/profile?tab=security"],
    ["https://evil.example", "/"],
    ["/sign-in", "/"],
  ])("redirects safely after sign-in with next=%s", (next, destination) => {
    window.history.replaceState(
      null,
      "",
      `/sign-in?next=${encodeURIComponent(next)}`,
    );
    render(
      <AuthProviderClient>
        <p>{"Screen"}</p>
      </AuthProviderClient>,
    );
    act(() => mocks.subscribe.mock.calls[0][1]({ uid: "user" }));
    expect(mocks.router.replace).toHaveBeenCalledWith(destination);
    expect(screen.queryByText("Screen")).toBeNull();
  });
});
