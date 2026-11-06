import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import en from "@/messages/en.json";
import { WelcomeHeroServer } from "./welcome-hero-server";

const mocks = vi.hoisted(() => ({ getSession: vi.fn() }));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/session", () => ({ getSession: mocks.getSession }));
vi.mock("./sign-out-button-client", () => ({
  SignOutButtonClient: () => <button type="button">{"Sign out"}</button>,
}));
vi.mock("@/components/ui/extensions/translation-text-server", () => ({
  TranslationTextServer: ({
    message,
    values,
  }: {
    message: string;
    values?: Record<string, string>;
  }) => {
    const [namespace, key] = message.split(".") as [
      "Home",
      keyof typeof en.Home,
    ];
    const name = values?.name === "Home.friend" ? en.Home.friend : values?.name;
    return en[namespace][key].replace("{name}", name ?? "");
  },
}));

async function renderHero() {
  render(await WelcomeHeroServer({}));
}

describe("WelcomeHeroServer", () => {
  afterEach(cleanup);

  it("offers sign in and registration to a visitor", async () => {
    mocks.getSession.mockResolvedValue({ isAuthenticated: false });
    await renderHero();
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(
      en.Home.title,
    );
    expect(
      screen.getByRole("link", { name: en.Home.signIn }).getAttribute("href"),
    ).toBe("/sign-in");
    expect(
      screen
        .getByRole("link", { name: en.Home.getStarted })
        .getAttribute("href"),
    ).toBe("/register");
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("greets the user and offers profile and sign out", async () => {
    mocks.getSession.mockResolvedValue({
      isAuthenticated: true,
      displayName: "Alex Smith",
    });
    await renderHero();
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(
      "Welcome, Alex Smith.",
    );
    expect(
      screen
        .getByRole("link", { name: en.Home.manageAccount })
        .getAttribute("href"),
    ).toBe("/profile");
    expect(screen.getAllByRole("button")).toHaveLength(1);
  });

  it("uses the friend fallback without a display name", async () => {
    mocks.getSession.mockResolvedValue({
      isAuthenticated: true,
      displayName: "",
    });
    await renderHero();
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(
      `Welcome, ${en.Home.friend}.`,
    );
  });
});
