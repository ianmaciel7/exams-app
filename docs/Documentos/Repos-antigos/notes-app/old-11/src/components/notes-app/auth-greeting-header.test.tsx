import { cleanup, render, screen } from "@testing-library/react";
import type { User } from "firebase/auth";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, describe, expect, it, vi } from "vitest";
import messages from "@/messages/en.json";
import { AuthGreetingHeader } from "./auth-greeting-header";

vi.mock("@/hooks/use-auth", () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from "@/hooks/use-auth";

function renderWithIntl(ui: React.ReactNode, locale = "en") {
  return render(
    <NextIntlClientProvider locale={locale} messages={messages}>
      {ui}
    </NextIntlClientProvider>
  );
}

describe("AuthGreetingHeader", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders guest greeting when user is null", () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      isLoading: false,
      signOutUser: vi.fn(),
    });

    renderWithIntl(<AuthGreetingHeader />);
    expect(screen.getByText("Notes App")).toBeDefined();
    expect(screen.getByText("Sign in to access your notes.")).toBeDefined();
  });

  it("renders user name when authenticated", () => {
    vi.mocked(useAuth).mockReturnValue({
      user: {
        uid: "user-1",
        displayName: "Ian Maciel",
        email: "ian@example.com",
        isAnonymous: false,
      } as unknown as User,
      isLoading: false,
      signOutUser: vi.fn(),
    });

    renderWithIntl(<AuthGreetingHeader />);
    expect(screen.getByText("Hello, Ian Maciel!")).toBeDefined();
    expect(
      screen.getByText("You are successfully connected to Firebase.")
    ).toBeDefined();
  });

  it("falls back to 'User' when displayName is empty", () => {
    vi.mocked(useAuth).mockReturnValue({
      user: {
        uid: "user-2",
        displayName: "",
        email: "test@example.com",
        isAnonymous: false,
      } as unknown as User,
      isLoading: false,
      signOutUser: vi.fn(),
    });

    renderWithIntl(<AuthGreetingHeader />);
    expect(screen.getByText("Hello, test!")).toBeDefined();
  });

  it("forwards className and HTML attributes", () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      isLoading: false,
      signOutUser: vi.fn(),
    });

    renderWithIntl(
      <AuthGreetingHeader
        data-testid="auth-greeting-container"
        className="custom-greeting-class"
        aria-label="auth-greeting"
      />
    );
    const element = screen.getByTestId("auth-greeting-container");
    expect(element.getAttribute("aria-label")).toBe("auth-greeting");
    expect(element.classList.contains("custom-greeting-class")).toBe(true);
    expect(element.classList.contains("flex")).toBe(true);
  });
});
