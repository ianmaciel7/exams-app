import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useAuth } from "@/hooks/use-auth";
import { AuthContext } from "@/lib/auth-context";
import { auth } from "@/lib/firebase/client";
import messages from "@/messages/en.json";
import { AuthProvider } from "./auth-provider";
import { RequireAuth } from "./require-auth";
import { UserMenu } from "./user-menu";

const { mockOnAuthStateChanged, mockSignOut } = vi.hoisted(() => ({
  mockOnAuthStateChanged: vi.fn((_auth, _callback) => vi.fn()),
  mockSignOut: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("firebase/auth", async (importOriginal) => {
  const actual = await importOriginal<typeof import("firebase/auth")>();
  return {
    ...actual,
    onAuthStateChanged: mockOnAuthStateChanged,
    signOut: mockSignOut,
    useDeviceLanguage: vi.fn(),
  };
});

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

function renderWithIntl(ui: React.ReactNode) {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      {ui}
    </NextIntlClientProvider>
  );
}

describe("AuthProvider and Auth components", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("subscribes to onAuthStateChanged on mount and unsubscribes on unmount", () => {
    const mockUnsubscribe = vi.fn();
    mockOnAuthStateChanged.mockReturnValueOnce(mockUnsubscribe);

    const { unmount } = render(
      <AuthProvider>
        <div>Provider Child</div>
      </AuthProvider>
    );

    expect(onAuthStateChanged).toHaveBeenCalledWith(auth, expect.any(Function));
    expect(mockUnsubscribe).not.toHaveBeenCalled();

    unmount();

    expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
  });

  it("updates user state and loading status when onAuthStateChanged fires", () => {
    let capturedCallback: ((user: User | null) => void) | undefined;
    mockOnAuthStateChanged.mockImplementationOnce((_auth, callback) => {
      if (typeof callback === "function") {
        capturedCallback = callback;
      }
      return vi.fn();
    });

    function TestConsumer() {
      const context = useAuth();
      return (
        <div>
          <span data-testid="user-state">
            {context.user?.email || "No user"}
          </span>
          <span data-testid="loading-state">
            {context.isLoading ? "loading" : "ready"}
          </span>
        </div>
      );
    }

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    expect(screen.getByTestId("user-state").textContent).toBe("No user");
    expect(screen.getByTestId("loading-state").textContent).toBe("loading");

    act(() => {
      capturedCallback?.({
        uid: "auth-user-999",
        email: "auth-user@notesapp.dev",
      } as User);
    });

    expect(screen.getByTestId("user-state").textContent).toBe(
      "auth-user@notesapp.dev"
    );
    expect(screen.getByTestId("loading-state").textContent).toBe("ready");
  });

  it("signOutUser invokes Firebase signOut with auth instance", async () => {
    mockSignOut.mockResolvedValueOnce(undefined);

    function TestConsumer() {
      const context = useAuth();
      return (
        <button
          data-testid="trigger-sign-out"
          type="button"
          onClick={() => void context.signOutUser()}
        >
          Sign Out
        </button>
      );
    }

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    const button = screen.getByTestId("trigger-sign-out");
    fireEvent.click(button);

    await waitFor(() => {
      expect(signOut).toHaveBeenCalledWith(auth);
    });
  });

  it("renders children within AuthProvider", () => {
    render(
      <AuthProvider>
        <div data-testid="child-element">Child Content</div>
      </AuthProvider>
    );

    expect(screen.getByTestId("child-element")).toBeDefined();
    expect(screen.getByText("Child Content")).toBeDefined();
  });

  it("UserMenu displays login button when unauthenticated", () => {
    renderWithIntl(
      <AuthContext
        value={{
          user: null,
          isLoading: false,
          signOutUser: async () => {},
        }}
      >
        <UserMenu />
      </AuthContext>
    );

    expect(screen.getByTestId("user-menu-login-link")).toBeDefined();
    expect(screen.getByText("Sign in")).toBeDefined();
  });

  it("UserMenu displays user email and Sair button when authenticated", () => {
    const mockUser = {
      uid: "test-user-123",
      email: "tester1@notesapp.dev",
      displayName: "Tester One",
      isAnonymous: false,
    } as unknown as User;

    renderWithIntl(
      <AuthContext
        value={{
          user: mockUser,
          isLoading: false,
          signOutUser: async () => {},
        }}
      >
        <UserMenu />
      </AuthContext>
    );

    expect(screen.getByTestId("user-menu")).toBeDefined();
    expect(screen.getByText("Tester One")).toBeDefined();
    expect(screen.getByTestId("user-menu-sign-out-btn")).toBeDefined();
  });

  it("RequireAuth renders fallback during loading", () => {
    renderWithIntl(
      <AuthContext
        value={{
          user: null,
          isLoading: true,
          signOutUser: async () => {},
        }}
      >
        <RequireAuth
          fallback={<div data-testid="custom-loading">Carregando...</div>}
        >
          <div>Conteúdo Protegido</div>
        </RequireAuth>
      </AuthContext>
    );

    expect(screen.getByTestId("custom-loading")).toBeDefined();
    expect(screen.queryByText("Conteúdo Protegido")).toBeNull();
  });

  it("RequireAuth renders protected content when authenticated", () => {
    const mockUser = {
      uid: "test-user-123",
      email: "tester1@notesapp.dev",
    } as unknown as User;

    renderWithIntl(
      <AuthContext
        value={{
          user: mockUser,
          isLoading: false,
          signOutUser: async () => {},
        }}
      >
        <RequireAuth>
          <div data-testid="protected-content">Conteúdo Protegido</div>
        </RequireAuth>
      </AuthContext>
    );

    expect(screen.getByTestId("protected-content")).toBeDefined();
    expect(screen.getByText("Conteúdo Protegido")).toBeDefined();
  });

  it("UserMenu forwards className and HTML attributes when unauthenticated", () => {
    renderWithIntl(
      <AuthContext
        value={{
          user: null,
          isLoading: false,
          signOutUser: async () => {},
        }}
      >
        <UserMenu
          data-testid="custom-login-container"
          className="custom-unauth-class"
          aria-label="User Navigation"
        />
      </AuthContext>
    );

    const element = screen.getByTestId("custom-login-container");
    expect(element.getAttribute("aria-label")).toBe("User Navigation");
    expect(element.classList.contains("custom-unauth-class")).toBe(true);
  });

  it("UserMenu forwards className and HTML attributes when authenticated", () => {
    const mockUser = {
      uid: "test-user-123",
      email: "tester1@notesapp.dev",
      displayName: "Tester One",
      isAnonymous: false,
    } as unknown as User;

    renderWithIntl(
      <AuthContext
        value={{
          user: mockUser,
          isLoading: false,
          signOutUser: async () => {},
        }}
      >
        <UserMenu className="custom-auth-class" aria-label="User Controls" />
      </AuthContext>
    );

    const element = screen.getByTestId("user-menu");
    expect(element.getAttribute("aria-label")).toBe("User Controls");
    expect(element.classList.contains("custom-auth-class")).toBe(true);
    expect(element.classList.contains("flex")).toBe(true);
  });
});
