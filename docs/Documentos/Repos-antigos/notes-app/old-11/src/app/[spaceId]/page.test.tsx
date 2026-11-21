import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import SpacePage from "./page";

vi.mock("next-intl/server", () => ({
  getTranslations: vi.fn(async (namespace: string) => {
    const translations: Record<string, Record<string, string>> = {
      app: {
        title: "Notes App",
        footer: "Notes App â€¢ Firebase Auth",
      },
      spaces: {
        backToHome: "Back to Home",
        activeSpace: "Active Space",
        spaceHeading: "Space: {id}",
      },
    };
    return (key: string, values?: Record<string, string>) => {
      const template = translations[namespace]?.[key] ?? key;
      return Object.entries(values ?? {}).reduce(
        (value, [name, replacement]) => value.replace(`{${name}}`, replacement),
        template
      );
    };
  }),
}));

vi.mock("@/components/notes-app/require-auth", () => ({
  RequireAuth: ({
    children,
    redirectTo,
  }: {
    children: React.ReactNode;
    redirectTo?: string;
  }) => (
    <div data-testid="mock-require-auth" data-redirect-to={redirectTo}>
      {children}
    </div>
  ),
}));

vi.mock("@/components/notes-app/space-shell", () => ({
  SpaceShell: ({
    currentSpaceId,
    children,
  }: {
    currentSpaceId?: string;
    children?: React.ReactNode;
  }) => (
    <div data-testid="mock-space-shell">
      SpaceShell for {currentSpaceId}
      {children}
    </div>
  ),
}));

describe("SpacePage", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders space page with active spaceId and space sidebar", async () => {
    const pageComponent = await SpacePage({
      params: Promise.resolve({ spaceId: "test-space-456" }),
      searchParams: Promise.resolve({}),
    } as Parameters<typeof SpacePage>[0]);

    render(pageComponent);

    expect(screen.getByText("Space: test-space-456")).toBeDefined();
    expect(screen.getByTestId("mock-space-shell")).toBeDefined();
    expect(screen.getByText("SpaceShell for test-space-456")).toBeDefined();
    expect(
      screen.getByTestId("mock-require-auth").getAttribute("data-redirect-to")
    ).toBe("/login?next=%2Ftest-space-456");
  });
});
