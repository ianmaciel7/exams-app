import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import ProtectedLayout from "./layout";

vi.mock("./_components/auth-gate-server", () => ({
  AuthGateServer: () => <div data-testid="auth-gate-server" />,
}));

vi.mock("./_components/protected-guard-client", () => ({
  ProtectedGuardClient: ({ children }: { children: React.ReactNode }) => (
    <section data-testid="protected-guard">{children}</section>
  ),
}));

afterEach(cleanup);

describe("ProtectedLayout", () => {
  it("composes the protected guard around its children and mounts AuthGateServer", () => {
    render(
      <ProtectedLayout params={Promise.resolve({})}>
        <p>{"Protected Content"}</p>
      </ProtectedLayout>,
    );
    expect(screen.getByTestId("protected-guard")).toBeTruthy();
    expect(screen.getByTestId("auth-gate-server")).toBeTruthy();
    expect(screen.getByText("Protected Content")).toBeTruthy();
  });
});
