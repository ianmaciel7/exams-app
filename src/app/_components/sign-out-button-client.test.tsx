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
import { SignOutButtonClient } from "./sign-out-button-client";

const mocks = vi.hoisted(() => ({
  signOut: vi.fn(),
  getUI: vi.fn(),
  refresh: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: mocks.refresh }),
}));

vi.mock("firebase/auth", () => ({
  signOut: mocks.signOut,
}));

vi.mock("@/lib/firebase/client", () => ({
  getFirebaseUI: mocks.getUI,
}));

describe("SignOutButtonClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getUI.mockReturnValue({ get: () => ({ auth: {} }) });
  });
  afterEach(cleanup);

  it("renders with custom className and accessible button text", () => {
    render(
      <NextIntlClientProvider locale="en" messages={en}>
        <SignOutButtonClient className="custom-signout-wrapper" />
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
        <SignOutButtonClient />
      </NextIntlClientProvider>,
    );

    const button = screen.getByRole("button", { name: en.Auth.signOut });
    expect(button.getAttribute("aria-describedby")).toBeNull();

    fireEvent.click(button);

    const alert = await screen.findByRole("alert");
    expect(alert.id).toBe("sign-out-error");
    expect(alert.textContent).toBe(en.Home.signOutError);
    expect(button.getAttribute("aria-describedby")).toBe("sign-out-error");
  });

  it("signs out, refreshes the server tree and ignores repeated clicks", async () => {
    let finish: () => void = () => {};
    mocks.signOut.mockReturnValue(
      new Promise<void>((resolve) => {
        finish = resolve;
      }),
    );

    render(
      <NextIntlClientProvider locale="en" messages={en}>
        <SignOutButtonClient />
      </NextIntlClientProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: en.Auth.signOut }));
    const pending = await screen.findByRole("button", {
      name: en.Home.signingOut,
    });
    expect(pending.getAttribute("aria-busy")).toBe("true");
    fireEvent.click(pending);
    await act(async () => {
      finish();
    });

    expect(mocks.signOut).toHaveBeenCalledOnce();
    expect(mocks.refresh).toHaveBeenCalledOnce();
  });
});
