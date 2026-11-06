import { enUs, esEs, ptBr } from "@firebase-oss/ui-translations";
import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import { Component, type ReactNode, Suspense } from "react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { PublicUiProviderClient } from "./public-ui-provider-client";

const mocks = vi.hoisted(() => ({
  router: { replace: vi.fn() },
  subscribe: vi.fn(),
  setLocale: vi.fn(),
  getUI: vi.fn(),
  unsubscribe: vi.fn(),
  syncSessionCookie: vi.fn(),
  signOutUser: vi.fn(),
  locale: "pt-BR",
  ui: undefined as Promise<unknown> | undefined,
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
  signOutUser: mocks.signOutUser,
}));
vi.mock("@/lib/dynamic", () => ({
  // `use` needs one stable Promise per load, like the real cached loader.
  loadFirebaseUi: () =>
    (mocks.ui ??= new Promise((resolve) => resolve(mocks.getUI()))),
}));
vi.mock("@/lib/firebase/client", () => ({
  subscribeToAuth: mocks.subscribe,
}));
vi.mock("@firebase-oss/ui-react", () => ({
  FirebaseUIProvider: ({ children }: { children: React.ReactNode }) => children,
}));

class ErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <p role="alert">{"failed"}</p>
    ) : (
      this.props.children
    );
  }
}

function tree(children: ReactNode) {
  return (
    <ErrorBoundary>
      <Suspense fallback={<p>{"loading"}</p>}>
        <PublicUiProviderClient>{children}</PublicUiProviderClient>
      </Suspense>
    </ErrorBoundary>
  );
}

async function renderProvider(children: ReactNode = <p>{"Screen"}</p>) {
  let view!: ReturnType<typeof render>;
  await act(async () => {
    view = render(tree(children));
  });
  await screen.findByText("Screen");
  return view;
}

afterEach(() => {
  cleanup();
  window.history.replaceState(null, "", "/");
});
beforeEach(() => {
  vi.clearAllMocks();
  mocks.ui = undefined;
  mocks.locale = "pt-BR";
  mocks.getUI.mockReturnValue({
    get: () => ({ auth: {}, setLocale: mocks.setLocale }),
  });
  mocks.subscribe.mockReturnValue(mocks.unsubscribe);
  mocks.syncSessionCookie.mockResolvedValue(true);
  mocks.signOutUser.mockResolvedValue(undefined);
});

it("provides the Firebase UI context and renders the screen without waiting for auth state", async () => {
  await renderProvider();
  expect(screen.getByText("Screen")).toBeTruthy();
  expect(mocks.setLocale).toHaveBeenCalled();
});

it("creates the session cookie before leaving the sign-in screen", async () => {
  let finishSync: (synced: boolean) => void = () => undefined;
  mocks.syncSessionCookie.mockReturnValue(
    new Promise<boolean>((resolve) => {
      finishSync = resolve;
    }),
  );
  await renderProvider();
  const user = { uid: "user" };
  act(() => mocks.subscribe.mock.calls[0][0](user));
  expect(mocks.syncSessionCookie).toHaveBeenCalledWith(user);
  expect(mocks.router.replace).not.toHaveBeenCalled();
  finishSync(true);
  await waitFor(() => expect(mocks.router.replace).toHaveBeenCalledWith("/"));
});

it("does not navigate after the screen is left while the cookie is pending", async () => {
  let finishSync: (synced: boolean) => void = () => undefined;
  mocks.syncSessionCookie.mockReturnValue(
    new Promise<boolean>((resolve) => {
      finishSync = resolve;
    }),
  );
  const { unmount } = await renderProvider();
  act(() => mocks.subscribe.mock.calls[0][0]({ uid: "user" }));
  unmount();
  finishSync(true);
  await Promise.resolve();
  expect(mocks.router.replace).not.toHaveBeenCalled();
});

it("redirects a signed-in user after creating the session cookie", async () => {
  await renderProvider();
  act(() => mocks.subscribe.mock.calls[0][0]({ uid: "user" }));
  await waitFor(() => expect(mocks.router.replace).toHaveBeenCalledWith("/"));
});

it("signs out and does not navigate when session cookie creation fails", async () => {
  mocks.syncSessionCookie.mockResolvedValue(false);
  await renderProvider();
  act(() => mocks.subscribe.mock.calls[0][0]({ uid: "user" }));
  await waitFor(() => expect(mocks.signOutUser).toHaveBeenCalledOnce());
  expect(mocks.router.replace).not.toHaveBeenCalled();
});

it("does not navigate for a signed-out user", async () => {
  await renderProvider();
  act(() => mocks.subscribe.mock.calls[0][0](null));
  expect(mocks.syncSessionCookie).not.toHaveBeenCalled();
  expect(mocks.router.replace).not.toHaveBeenCalled();
});

it("syncs locale changes without recreating the store or subscription", async () => {
  const view = await renderProvider("Screen");
  expect(mocks.setLocale).toHaveBeenLastCalledWith(ptBr);
  mocks.locale = "es";
  view.rerender(tree("Screen"));
  expect(mocks.setLocale).toHaveBeenLastCalledWith(esEs);
  mocks.locale = "unsupported";
  view.rerender(tree("Screen"));
  expect(mocks.setLocale).toHaveBeenLastCalledWith(enUs);
  expect(mocks.subscribe).toHaveBeenCalledOnce();
});

it("unsubscribes and ignores session callbacks after unmount", async () => {
  const view = await renderProvider("Screen");
  const onSession = mocks.subscribe.mock.calls[0][0];
  view.unmount();
  expect(mocks.unsubscribe).toHaveBeenCalledOnce();
  act(() => onSession({ uid: "late-user" }));
  expect(mocks.router.replace).not.toHaveBeenCalled();
});

it("hands a Firebase configuration failure to the error boundary", async () => {
  mocks.getUI.mockImplementation(() => {
    throw new Error("missing configuration");
  });
  const log = vi.spyOn(console, "error").mockImplementation(() => {});
  await act(async () => {
    render(tree(<p>{"Screen"}</p>));
  });
  expect((await screen.findByRole("alert")).textContent).toBe("failed");
  log.mockRestore();
});

it.each([
  ["/profile?tab=security", "/profile?tab=security"],
  ["https://evil.example", "/"],
  ["/sign-in", "/"],
])("redirects safely after sign-in with next=%s", async (next, destination) => {
  window.history.replaceState(
    null,
    "",
    `/sign-in?next=${encodeURIComponent(next)}`,
  );
  await renderProvider();
  act(() => mocks.subscribe.mock.calls[0][0]({ uid: "user" }));
  await waitFor(() =>
    expect(mocks.router.replace).toHaveBeenCalledWith(destination),
  );
});
