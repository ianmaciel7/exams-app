import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { FirebaseError } from "firebase/app";
import {
  getRedirectResult,
  signInAnonymously,
  signInWithPopup,
  signInWithRedirect,
  type UserCredential,
} from "firebase/auth";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AuthProvider } from "@/components/notes-app/auth-provider";
import messages from "@/messages/en.json";
import LoginPage from "./page";

const { mockReplace, mockPush, mockSearchParamsGet, MockGoogleAuthProvider } =
  vi.hoisted(() => {
    class MockGoogleAuthProvider {
      scopes: string[] = [];
      addScope(scope: string) {
        this.scopes.push(scope);
      }
    }

    return {
      mockReplace: vi.fn(),
      mockPush: vi.fn(),
      mockSearchParamsGet: vi.fn().mockReturnValue(null),
      MockGoogleAuthProvider,
    };
  });

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: mockReplace,
    push: mockPush,
  }),
  useSearchParams: () => ({
    get: (key: string) => mockSearchParamsGet(key),
  }),
}));

vi.mock("firebase/auth", async (importOriginal) => {
  const actual = await importOriginal<typeof import("firebase/auth")>();
  return {
    ...actual,
    getRedirectResult: vi.fn(),
    onAuthStateChanged: vi.fn((_auth, callback) => {
      callback(null);
      return vi.fn();
    }),
    signInWithPopup: vi.fn(),
    signInWithRedirect: vi.fn(),
    signInAnonymously: vi.fn(),
    GoogleAuthProvider: MockGoogleAuthProvider,
  };
});

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParamsGet.mockReturnValue(null);
    vi.mocked(getRedirectResult).mockResolvedValue(null);
  });

  afterEach(() => {
    cleanup();
  });

  function renderLoginPage() {
    return render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </NextIntlClientProvider>
    );
  }

  it("renders in default signIn mode and toggles to signUp mode and back", () => {
    renderLoginPage();

    // Default signIn mode renders anonymous sign-in button
    expect(
      screen.getByTestId("login-shell-anonymous-sign-in-btn")
    ).toBeDefined();
    expect(
      screen.queryByTestId("login-shell-anonymous-sign-up-btn")
    ).toBeNull();

    // Find and click the toggle to sign up mode
    const signUpToggleBtn = screen.getByText(/don't have an account/i);
    fireEvent.click(signUpToggleBtn);

    // View should switch to signUp mode
    expect(
      screen.getByTestId("login-shell-anonymous-sign-up-btn")
    ).toBeDefined();
    expect(
      screen.queryByTestId("login-shell-anonymous-sign-in-btn")
    ).toBeNull();

    // Find and click the toggle back to sign in mode
    const signInToggleBtn = screen.getByText(/already have an account/i);
    fireEvent.click(signInToggleBtn);

    // View should switch back to signIn mode
    expect(
      screen.getByTestId("login-shell-anonymous-sign-in-btn")
    ).toBeDefined();
  });

  it("processes getRedirectResult on mount and redirects if user exists", async () => {
    vi.mocked(getRedirectResult).mockResolvedValueOnce({
      user: { uid: "redirect-user-123" },
    } as unknown as UserCredential);

    renderLoginPage();

    await waitFor(() => {
      expect(getRedirectResult).toHaveBeenCalled();
      expect(mockReplace).toHaveBeenCalledWith("/");
    });
  });

  it("handles successful Google popup login and redirects to default nextUrl", async () => {
    vi.mocked(signInWithPopup).mockResolvedValueOnce({
      user: { uid: "google-user-123" },
    } as unknown as UserCredential);

    renderLoginPage();

    const googleBtn = screen.getByTestId("google-sign-in-button");
    fireEvent.click(googleBtn);

    await waitFor(() => {
      expect(signInWithPopup).toHaveBeenCalledWith(
        expect.anything(),
        expect.any(MockGoogleAuthProvider)
      );
      expect(mockReplace).toHaveBeenCalledWith("/");
    });
  });

  it("falls back to signInWithRedirect when Google popup encounters popup-blocked error", async () => {
    vi.mocked(signInWithPopup).mockRejectedValueOnce(
      new FirebaseError("auth/popup-blocked", "popup was blocked by browser")
    );
    vi.mocked(signInWithRedirect).mockImplementationOnce(
      () => Promise.resolve() as never
    );

    renderLoginPage();

    const googleBtn = screen.getByTestId("google-sign-in-button");
    fireEvent.click(googleBtn);

    await waitFor(() => {
      expect(signInWithPopup).toHaveBeenCalled();
      expect(signInWithRedirect).toHaveBeenCalledWith(
        expect.anything(),
        expect.any(MockGoogleAuthProvider)
      );
    });
    expect(screen.queryByTestId("login-shell-auth-error")).toBeNull();
  });

  it("does not depend on error message text to choose the redirect fallback", async () => {
    vi.mocked(signInWithPopup).mockRejectedValueOnce(
      new FirebaseError("auth/popup-blocked", "mensagem localizada")
    );
    vi.mocked(signInWithRedirect).mockImplementationOnce(
      () => Promise.resolve() as never
    );

    renderLoginPage();

    fireEvent.click(screen.getByTestId("google-sign-in-button"));

    await waitFor(() => {
      expect(signInWithRedirect).toHaveBeenCalled();
    });
  });

  it("shows an error when Google sign-in fails for a non-fallback reason", async () => {
    vi.mocked(signInWithPopup).mockRejectedValueOnce(
      new FirebaseError("auth/network-request-failed", "network down")
    );

    renderLoginPage();

    fireEvent.click(screen.getByTestId("google-sign-in-button"));

    const alert = await screen.findByTestId("login-shell-auth-error");
    expect(alert.textContent).toContain(messages.auth.googleSignInFailed);
    expect(signInWithRedirect).not.toHaveBeenCalled();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("shows an error when the redirect fallback itself fails", async () => {
    vi.mocked(signInWithPopup).mockRejectedValueOnce(
      new FirebaseError("auth/popup-blocked", "blocked")
    );
    vi.mocked(signInWithRedirect).mockRejectedValueOnce(
      new FirebaseError("auth/internal-error", "redirect failed")
    );

    renderLoginPage();

    fireEvent.click(screen.getByTestId("google-sign-in-button"));

    const alert = await screen.findByTestId("login-shell-auth-error");
    expect(alert.textContent).toContain(messages.auth.googleSignInFailed);
  });

  it("stays silent when a newer popup request cancels the previous one", async () => {
    vi.mocked(signInWithPopup).mockRejectedValueOnce(
      new FirebaseError("auth/cancelled-popup-request", "cancelled")
    );

    renderLoginPage();

    fireEvent.click(screen.getByTestId("google-sign-in-button"));

    await waitFor(() => {
      expect(signInWithPopup).toHaveBeenCalled();
    });
    expect(screen.queryByTestId("login-shell-auth-error")).toBeNull();
    expect(signInWithRedirect).not.toHaveBeenCalled();
  });

  it("shows an error when the redirect result rejects", async () => {
    vi.mocked(getRedirectResult).mockRejectedValueOnce(
      new FirebaseError("auth/account-exists-with-different-credential", "x")
    );

    renderLoginPage();

    const alert = await screen.findByTestId("login-shell-auth-error");
    expect(alert.textContent).toContain(messages.auth.googleSignInFailed);
  });

  it("shows an error when anonymous sign-in fails", async () => {
    vi.mocked(signInAnonymously).mockRejectedValueOnce(
      new FirebaseError("auth/admin-restricted-operation", "disabled")
    );

    renderLoginPage();

    fireEvent.click(screen.getByTestId("login-shell-anonymous-sign-in-btn"));

    const alert = await screen.findByTestId("login-shell-auth-error");
    expect(alert.textContent).toContain(messages.auth.guestSignInFailed);
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("falls back to signInWithRedirect when Google popup encounters 'No matching frame' error", async () => {
    vi.mocked(signInWithPopup).mockRejectedValueOnce(
      new Error("No matching frame for popup")
    );
    vi.mocked(signInWithRedirect).mockImplementationOnce(
      () => Promise.resolve() as never
    );

    renderLoginPage();

    const googleBtn = screen.getByTestId("google-sign-in-button");
    fireEvent.click(googleBtn);

    await waitFor(() => {
      expect(signInWithRedirect).toHaveBeenCalled();
    });
  });

  it("handles anonymous sign-in action and redirects", async () => {
    vi.mocked(signInAnonymously).mockResolvedValueOnce({
      user: { uid: "anon-user-123" },
    } as unknown as UserCredential);

    renderLoginPage();

    const anonBtn = screen.getByTestId("login-shell-anonymous-sign-in-btn");
    fireEvent.click(anonBtn);

    await waitFor(() => {
      expect(signInAnonymously).toHaveBeenCalled();
      expect(mockReplace).toHaveBeenCalledWith("/");
    });
  });

  it("respects query param 'next' for redirection after login", async () => {
    mockSearchParamsGet.mockImplementation((key: string) =>
      key === "next" ? "/dashboard" : null
    );
    vi.mocked(signInAnonymously).mockResolvedValueOnce({
      user: { uid: "anon-user-456" },
    } as unknown as UserCredential);

    renderLoginPage();

    const anonBtn = screen.getByTestId("login-shell-anonymous-sign-in-btn");
    fireEvent.click(anonBtn);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/dashboard");
    });
  });
  it("rejects unsafe next URLs and falls back to the home route", async () => {
    mockSearchParamsGet.mockImplementation((key: string) =>
      key === "next" ? "javascript:alert(document.domain)" : null
    );
    vi.mocked(signInAnonymously).mockResolvedValueOnce({
      user: { uid: "anon-user-unsafe-next" },
    } as unknown as UserCredential);

    renderLoginPage();

    fireEvent.click(screen.getByTestId("login-shell-anonymous-sign-in-btn"));

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/");
    });
  });
});
