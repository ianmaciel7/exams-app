import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import messages from "@/messages/en.json";
import type { Space } from "@/types/space";
import { SpaceShell } from "./space-shell";

function renderWithIntl(ui: React.ReactNode) {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      {ui}
    </NextIntlClientProvider>
  );
}

const mockPush = vi.fn();
const mockReplace = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
  }),
}));

const mockUseSpaces = vi.fn();
vi.mock("@/hooks/use-spaces", () => ({
  useSpaces: () => mockUseSpaces(),
}));

vi.mock("@/hooks/use-exam-navigation", () => ({
  useExamNavigation: () => ({ exams: [], loading: false, error: null }),
}));

const mockUseAuth = vi.fn();
vi.mock("@/hooks/use-auth", () => ({
  useAuth: () => mockUseAuth(),
}));

describe("SpaceShell", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({
      user: { uid: "test-user-id" },
      isLoading: false,
    });
    mockUseSpaces.mockReturnValue({
      spaces: [],
      loading: false,
      error: null,
      isOffline: false,
      retry: vi.fn(),
      createSpace: vi.fn(),
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("redirects unauthenticated users from the home route to login", () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isLoading: false,
    });

    const { container } = renderWithIntl(<SpaceShell />);
    expect(container.firstChild).toBeNull();
    expect(mockReplace).toHaveBeenCalledWith("/login");
  });

  it("redirects the home route to the first available space", () => {
    const spaces: Space[] = [
      {
        id: "space-1",
        ownerId: "uid-1",
        name: "Personal",
        description: "",
        icon: "folder",
        stateVersion: 1,
        schemaVersion: 1,
        createdAt: null,
        updatedAt: null,
      },
    ];

    mockUseSpaces.mockReturnValue({
      spaces,
      loading: false,
      error: null,
      isOffline: false,
      retry: vi.fn(),
      createSpace: vi.fn(),
    });

    renderWithIntl(<SpaceShell />);

    expect(mockReplace).toHaveBeenCalledWith("/space-1");
  });

  it("does not redirect while authentication is loading", () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isLoading: true,
    });

    renderWithIntl(<SpaceShell />);

    expect(mockReplace).not.toHaveBeenCalled();
    expect(screen.getByTestId("space-loading")).toBeDefined();
    expect(screen.getByRole("status").getAttribute("aria-label")).toBe(
      "Loading spaces..."
    );
  });

  it("renders accessible error alert with retry button when error occurs", () => {
    const retryMock = vi.fn();
    mockUseSpaces.mockReturnValue({
      spaces: [],
      loading: false,
      error: new Error("auth/network-request-failed"),
      isOffline: false,
      retry: retryMock,
      createSpace: vi.fn(),
    });

    renderWithIntl(<SpaceShell />);

    expect(screen.getByTestId("spaces-error-status")).toBeDefined();
    expect(screen.getByRole("alert")).toBeDefined();
    expect(screen.getByText("Connection Error")).toBeDefined();

    const retryBtn = screen.getByTestId("spaces-error-status-retry-btn");
    expect(retryBtn.textContent).toContain("Retry Connection");
    fireEvent.click(retryBtn);
    expect(retryMock).toHaveBeenCalled();
  });

  it("keeps the main shell available when the spaces hook is offline", () => {
    const spaces: Space[] = [
      {
        id: "space-1",
        ownerId: "uid-1",
        name: "Personal",
        description: "",
        icon: "folder",
        stateVersion: 1,
        schemaVersion: 1,
        createdAt: null,
        updatedAt: null,
      },
    ];

    mockUseSpaces.mockReturnValue({
      spaces,
      loading: false,
      error: null,
      isOffline: true,
      retry: vi.fn(),
      createSpace: vi.fn(),
    });

    renderWithIntl(<SpaceShell currentSpaceId="space-1" />);

    expect(screen.getByTestId("space-shell")).toBeDefined();
  });

  it("renders loading state", () => {
    mockUseSpaces.mockReturnValue({
      spaces: [],
      loading: true,
      error: null,
      isOffline: false,
      retry: vi.fn(),
      createSpace: vi.fn(),
    });

    renderWithIntl(<SpaceShell />);
    expect(screen.getByTestId("spaces-loading-status")).toBeDefined();
    expect(screen.getByText("Loading spaces...")).toBeDefined();
  });

  it("renders empty state using Empty component when spaces are empty", () => {
    mockUseSpaces.mockReturnValue({
      spaces: [],
      loading: false,
      error: null,
      isOffline: false,
      retry: vi.fn(),
      createSpace: vi.fn(),
    });

    renderWithIntl(<SpaceShell />);
    expect(screen.getByTestId("spaces-empty")).toBeDefined();
    expect(screen.getByTestId("space-switcher-create-trigger")).toBeDefined();
    expect(screen.getByText("No Spaces Found")).toBeDefined();
    expect(screen.getByTestId("spaces-empty-create-btn")).toBeDefined();
    expect(screen.queryByText("No matching spaces")).toBeNull();
  });

  it("shows existing spaces in the switcher menu", () => {
    const spaces: Space[] = [
      {
        id: "space-1",
        ownerId: "uid-1",
        name: "Personal",
        description: "",
        icon: "folder",
        stateVersion: 1,
        schemaVersion: 1,
        createdAt: null,
        updatedAt: null,
      },
    ];

    mockUseSpaces.mockReturnValue({
      spaces,
      loading: false,
      error: null,
      isOffline: false,
      retry: vi.fn(),
      createSpace: vi.fn(),
    });

    renderWithIntl(<SpaceShell currentSpaceId="space-1" />);
    fireEvent.click(screen.getByTestId("space-switcher-trigger"));

    expect(screen.getByTestId("space-switcher-item-space-1")).toBeDefined();
    expect(screen.queryByText("No matching spaces")).toBeNull();
  });

  it("renders inline switcher trigger and enter button when spaces exist", () => {
    const spaces: Space[] = [
      {
        id: "space-1",
        ownerId: "uid-1",
        name: "Personal",
        description: "",
        icon: "folder",
        stateVersion: 1,
        schemaVersion: 1,
        createdAt: null,
        updatedAt: null,
      },
    ];

    mockUseSpaces.mockReturnValue({
      spaces,
      loading: false,
      error: null,
      isOffline: false,
      retry: vi.fn(),
      createSpace: vi.fn(),
    });

    renderWithIntl(<SpaceShell currentSpaceId="space-1" />);

    expect(screen.getByTestId("space-shell")).toBeDefined();
    expect(screen.getByTestId("space-switcher-trigger")).toBeDefined();
    expect(screen.getAllByText("Personal").length).toBeGreaterThan(0);

    fireEvent.click(screen.getByTestId("space-switcher-trigger"));
    fireEvent.click(screen.getByTestId("space-switcher-item-space-1"));
    expect(mockPush).toHaveBeenCalledWith("/space-1");
  });

  it("shows account details and only sign out in the user menu", () => {
    mockUseAuth.mockReturnValue({
      user: {
        uid: "test-user-id",
        displayName: "Ian Maciel Carvalho",
        email: "ianmaciel76@gmail.com",
        isAnonymous: false,
      },
      isLoading: false,
    });

    const spaces: Space[] = [
      {
        id: "space-1",
        ownerId: "test-user-id",
        name: "Personal",
        description: "",
        icon: "folder",
        stateVersion: 1,
        schemaVersion: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    mockUseSpaces.mockReturnValue({
      spaces,
      loading: false,
      error: null,
      isOffline: false,
      retry: vi.fn(),
      createSpace: vi.fn(),
    });

    renderWithIntl(<SpaceShell currentSpaceId="space-1" />);

    fireEvent.click(screen.getByRole("button", { name: "Open user menu" }));

    expect(screen.getAllByText("Ian Maciel Carvalho").length).toBeGreaterThan(
      1
    );
    expect(screen.getByText("ianmaciel76@gmail.com")).toBeDefined();
    expect(screen.getByRole("menuitem", { name: "Sign out" })).toBeDefined();
    expect(screen.queryByText("Profile")).toBeNull();
    expect(screen.queryByRole("menuitem", { name: "Settings" })).toBeNull();
  });

  it("does not fall back to another space when currentSpaceId is invalid", () => {
    const spaces: Space[] = [
      {
        id: "space-1",
        ownerId: "uid-1",
        name: "Personal",
        description: "",
        icon: "folder",
        stateVersion: 1,
        schemaVersion: 1,
        createdAt: null,
        updatedAt: null,
      },
    ];

    mockUseSpaces.mockReturnValue({
      spaces,
      loading: false,
      error: null,
      isOffline: false,
      retry: vi.fn(),
      createSpace: vi.fn(),
    });

    renderWithIntl(<SpaceShell currentSpaceId="missing-space" />);

    expect(screen.getByTestId("spaces-not-found-status")).toBeDefined();
    expect(screen.getByTestId("space-shell")).toBeDefined();
    expect(screen.getByTestId("space-switcher-trigger")).toBeDefined();

    fireEvent.click(screen.getByTestId("spaces-not-found-status-back-btn"));
    expect(mockReplace).toHaveBeenCalledWith("/");
  });
});
