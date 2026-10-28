import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import ProtectedLayout from "./layout";

const mocks = vi.hoisted(() => ({ reject: vi.fn() }));

vi.mock("./_lib/dal", () => ({ rejectInvalidBridgeSession: mocks.reject }));
vi.mock("./_components/auth-gate-client", () => ({
  AuthGateClient: ({ children }: { children: React.ReactNode }) => (
    <section data-testid="auth-gate">{children}</section>
  ),
}));
vi.mock("./_components/route-usage-client", () => ({
  RouteUsageClient: ({ children }: { children: React.ReactNode }) => (
    <section data-testid="route-usage">{children}</section>
  ),
}));

afterEach(cleanup);

describe("ProtectedLayout", () => {
  it("rejects a failed bridge session, then composes the gate around its children", async () => {
    render(
      await ProtectedLayout({
        params: Promise.resolve({}),
        children: <p>{"Protected Content"}</p>,
      }),
    );
    expect(mocks.reject).toHaveBeenCalledOnce();
    expect(screen.getByTestId("auth-gate")).toBeTruthy();
    expect(screen.getByTestId("route-usage")).toBeTruthy();
    expect(screen.getByText("Protected Content")).toBeTruthy();
  });
});
