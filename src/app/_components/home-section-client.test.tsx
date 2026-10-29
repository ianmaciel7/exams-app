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
import { HomeSectionClient } from "./home-section-client";

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

function renderHome() {
  return render(
    <NextIntlClientProvider locale="en" messages={en}>
      <HomeSectionClient />
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
  it("waits for authentication before offering registration", () => {
    renderHome();
    expect(screen.queryByRole("link", { name: en.Home.getStarted })).toBeNull();
    expect(screen.queryByRole("heading", { level: 1 })).toBeNull();
    expect(screen.getByRole("status").textContent).toBe(en.Home.loading);
    expect(screen.queryByRole("presentation")).toBeNull();
    act(() => mocks.subscribe.mock.calls[0][1](null));
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
  it("shows the public build tag after authentication resolves", () => {
    vi.stubEnv("NEXT_PUBLIC_GIT_TAG", "v1.2.3");

    renderHome();
    act(() => mocks.subscribe.mock.calls[0][1](null));

    expect(screen.getByText("v1.2.3").dataset.variant).toBe("secondary");
  });
  it("personalizes the home and returns to visitor actions after sign out", () => {
    const { unmount } = renderHome();
    act(() =>
      mocks.subscribe.mock.calls[0][1]({
        displayName: "Alex Smith",
        email: "alex@example.test",
      }),
    );
    expect(screen.getByRole("heading", { level: 1 }).textContent).toContain(
      "Welcome, Alex Smith.",
    );
    expect(
      screen
        .getByRole("link", { name: en.Home.manageAccount })
        .getAttribute("href"),
    ).toBe("/profile");
    expect(screen.queryByRole("link", { name: en.Home.getStarted })).toBeNull();
    act(() => mocks.subscribe.mock.calls[0][1](null));
    expect(
      screen.getByRole("link", { name: en.Home.getStarted }),
    ).toBeDefined();
    unmount();
    expect(mocks.unsubscribe).toHaveBeenCalledOnce();
  });
  it("uses the friend fallback when displayName is not provided", () => {
    renderHome();
    act(() =>
      mocks.subscribe.mock.calls[0][1]({
        displayName: "",
        email: "alex@example.test",
      }),
    );
    expect(screen.getByRole("heading", { level: 1 }).textContent).toContain(
      `Welcome, ${en.Home.friend}.`,
    );
  });
  it("only offers profile and sign out when authenticated and restores visitor home after logout", async () => {
    mocks.signOut.mockImplementation(async () => {
      mocks.subscribe.mock.calls[0][1](null);
    });
    renderHome();
    act(() =>
      mocks.subscribe.mock.calls[0][1]({
        displayName: "Alex",
        email: "alex@example.test",
      }),
    );
    expect(screen.getAllByRole("link")).toHaveLength(1);
    expect(screen.getAllByRole("button")).toHaveLength(1);
    await act(async () =>
      fireEvent.click(screen.getByRole("button", { name: en.Auth.signOut })),
    );
    expect(mocks.signOut).toHaveBeenCalledOnce();
    expect(screen.getByRole("link", { name: en.Home.signIn })).toBeDefined();
  });

  it("shows the shared loading indicator and prevents repeated sign-out requests", async () => {
    let finish: () => void = () => {};
    mocks.signOut.mockReturnValue(
      new Promise<void>((resolve) => {
        finish = resolve;
      }),
    );
    renderHome();
    act(() => mocks.subscribe.mock.calls[0][1]({ displayName: "Alex" }));
    fireEvent.click(screen.getByRole("button", { name: en.Auth.signOut }));
    const pending = screen.getByRole("button", { name: en.Home.signingOut });
    expect(pending.hasAttribute("disabled")).toBe(true);
    expect(pending.getAttribute("aria-busy")).toBe("true");
    fireEvent.click(pending);
    expect(mocks.signOut).toHaveBeenCalledOnce();
    await act(async () => {
      finish();
    });
  });

  it("allows retrying when sign out fails", async () => {
    mocks.signOut.mockRejectedValue(new Error("network"));
    renderHome();
    act(() => mocks.subscribe.mock.calls[0][1]({ displayName: "Alex" }));
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

  it("keeps visitor access available if Firebase configuration is missing", () => {
    mocks.getUI.mockImplementation(() => {
      throw new Error("missing configuration");
    });
    renderHome();
    expect(
      screen.getByRole("link", { name: en.Home.signIn }).getAttribute("href"),
    ).toBe("/sign-in");
  });
});
