import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import en from "@/messages/en.json";
import { HomeSignOutButtonClient } from "./home-sign-out-button-client";

const mocks = vi.hoisted(() => ({
  signOut: vi.fn(),
  getUI: vi.fn(),
}));

vi.mock("firebase/auth", () => ({
  signOut: mocks.signOut,
}));

vi.mock("@/lib/firebase/client", () => ({
  getFirebaseUI: mocks.getUI,
}));

describe("HomeSignOutButtonClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getUI.mockReturnValue({ get: () => ({ auth: {} }) });
  });
  afterEach(cleanup);

  it("renders with custom className and accessible button text", () => {
    render(
      <NextIntlClientProvider locale="en" messages={en}>
        <HomeSignOutButtonClient className="custom-signout-wrapper" />
      </NextIntlClientProvider>,
    );

    const button = screen.getByRole("button", { name: en.Auth.signOut });
    expect(button).toBeDefined();
    expect(button.parentElement?.className).toContain("custom-signout-wrapper");
  });

  it("links error message via aria-describedby when sign out fails", async () => {
    mocks.signOut.mockRejectedValue(new Error("network error"));

    render(
      <NextIntlClientProvider locale="en" messages={en}>
        <HomeSignOutButtonClient />
      </NextIntlClientProvider>,
    );

    const button = screen.getByRole("button", { name: en.Auth.signOut });
    expect(button.getAttribute("aria-describedby")).toBeNull();

    fireEvent.click(button);

    const alert = await screen.findByRole("alert");
    expect(alert.id).toBe("home-sign-out-error");
    expect(alert.textContent).toBe(en.Home.signOutError);
    expect(button.getAttribute("aria-describedby")).toBe("home-sign-out-error");
  });
});
