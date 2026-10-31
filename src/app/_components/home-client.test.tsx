import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import en from "@/messages/en.json";
import { HomeClient } from "./home-client";

const mocks = vi.hoisted(() => ({
  subscribe: vi.fn(),
  unsubscribe: vi.fn(),
  getUI: vi.fn(),
  signOut: vi.fn(),
}));
vi.mock("firebase/auth", () => ({
  onAuthStateChanged: mocks.subscribe,
  signOut: mocks.signOut,
}));
vi.mock("@/lib/firebase/client", () => ({ getFirebaseUI: mocks.getUI }));

// The home imports Firebase after hydration, so the session subscription
// starts asynchronously.
async function resolveSession(user: unknown) {
  await vi.waitFor(() => expect(mocks.subscribe).toHaveBeenCalled());
  act(() => mocks.subscribe.mock.calls[0][1](user));
}

function renderHome() {
  return render(
    <NextIntlClientProvider locale="en" messages={en}>
      <HomeClient />
    </NextIntlClientProvider>,
  );
}

describe("home session", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.subscribe.mockReturnValue(mocks.unsubscribe);
    mocks.getUI.mockReturnValue({ get: () => ({ auth: {} }) });
  });
  afterEach(() => {
    cleanup();
    vi.unstubAllEnvs();
  });
  it("paints the hero right away and waits for authentication before offering registration", async () => {
    renderHome();
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(
      en.Home.title,
    );
    expect(screen.getByText(en.Home.description)).toBeDefined();
    expect(screen.getByRole("presentation")).toBeDefined();
    expect(screen.queryByRole("link", { name: en.Home.getStarted })).toBeNull();
    expect(screen.getByRole("status").textContent).toBe(en.Home.loading);
    await resolveSession(null);
    expect(
      screen
        .getByRole("link", { name: en.Home.getStarted })
        .getAttribute("href"),
    ).toBe("/register");
    expect(
      screen.getByRole("link", { name: en.Home.signIn }).getAttribute("href"),
    ).toBe("/sign-in");
    expect(screen.queryByRole("status")).toBeNull();
    expect(screen.getByRole("presentation")).toBeDefined();
  });
  it("shows the public build tag after authentication resolves", async () => {
    vi.stubEnv("NEXT_PUBLIC_GIT_TAG", "v1.2.3");

    renderHome();
    await resolveSession(null);

    expect(screen.getByText("v1.2.3").dataset.variant).toBe("secondary");
  });
  it("personalizes the home and returns to visitor actions after sign out", async () => {
    const { unmount } = renderHome();
    await resolveSession({
      displayName: "Alex Smith",
      email: "alex@example.test",
    });
    expect(screen.getByRole("heading", { level: 1 }).textContent).toContain(
      "Welcome, Alex Smith.",
    );
    expect(
      screen
        .getByRole("link", { name: en.Home.manageAccount })
        .getAttribute("href"),
    ).toBe("/profile");
    expect(screen.queryByRole("link", { name: en.Home.getStarted })).toBeNull();
    await resolveSession(null);
    expect(
      screen.getByRole("link", { name: en.Home.getStarted }),
    ).toBeDefined();
    unmount();
    expect(mocks.unsubscribe).toHaveBeenCalledOnce();
  });
  it("uses the friend fallback when displayName is not provided", async () => {
    renderHome();
    await resolveSession({
      displayName: "",
      email: "alex@example.test",
    });
    expect(screen.getByRole("heading", { level: 1 }).textContent).toContain(
      `Welcome, ${en.Home.friend}.`,
    );
  });
  it("only offers profile and sign out when authenticated and restores visitor home after logout", async () => {
    mocks.signOut.mockImplementation(async () => {
      mocks.subscribe.mock.calls[0][1](null);
    });
    renderHome();
    await resolveSession({
      displayName: "Alex",
      email: "alex@example.test",
    });
    expect(screen.getAllByRole("link")).toHaveLength(1);
    expect(screen.getAllByRole("button")).toHaveLength(1);
    await act(async () =>
      fireEvent.click(screen.getByRole("button", { name: en.Auth.signOut })),
    );
    expect(
      await screen.findByRole("link", { name: en.Home.signIn }),
    ).toBeDefined();
    expect(mocks.signOut).toHaveBeenCalledOnce();
  });

  it("shows the shared loading indicator and prevents repeated sign-out requests", async () => {
    let finish: () => void = () => {};
    mocks.signOut.mockReturnValue(
      new Promise<void>((resolve) => {
        finish = resolve;
      }),
    );
    renderHome();
    await resolveSession({ displayName: "Alex" });
    fireEvent.click(screen.getByRole("button", { name: en.Auth.signOut }));
    const pending = screen.getByRole("button", { name: en.Home.signingOut });
    expect(pending.hasAttribute("disabled")).toBe(true);
    expect(pending.getAttribute("aria-busy")).toBe("true");
    fireEvent.click(pending);
    await vi.waitFor(() => expect(mocks.signOut).toHaveBeenCalled());
    expect(mocks.signOut).toHaveBeenCalledOnce();
    await act(async () => {
      finish();
    });
  });

  it("allows retrying when sign out fails", async () => {
    mocks.signOut.mockRejectedValue(new Error("network"));
    renderHome();
    await resolveSession({ displayName: "Alex" });
    await act(async () =>
      fireEvent.click(screen.getByRole("button", { name: en.Auth.signOut })),
    );
    expect(screen.getByRole("alert").textContent).toBe(en.Home.signOutError);
    expect(
      screen
        .getByRole("button", { name: en.Auth.signOut })
        .hasAttribute("disabled"),
    ).toBe(false);
    expect(
      screen.getByRole("link", { name: en.Home.manageAccount }),
    ).toBeDefined();
  });

  it("keeps visitor access available if Firebase configuration is missing", async () => {
    mocks.getUI.mockImplementation(() => {
      throw new Error("missing configuration");
    });
    renderHome();
    expect(
      (await screen.findByRole("link", { name: en.Home.signIn })).getAttribute(
        "href",
      ),
    ).toBe("/sign-in");
  });
});
