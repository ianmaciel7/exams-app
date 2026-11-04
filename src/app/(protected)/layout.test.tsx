import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import ProtectedLayout from "./layout";

const mocks = vi.hoisted(() => ({ reject: vi.fn() }));

vi.mock("./_lib/dal", () => ({ rejectInvalidBridgeSession: mocks.reject }));
vi.mock("./_components/auth-guard-client", () => ({
  AuthGuardClient: ({ children }: { children: React.ReactNode }) => (
    <section data-testid="auth-guard">{children}</section>
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
    expect(screen.getByTestId("auth-guard")).toBeTruthy();
    expect(screen.getByText("Protected Content")).toBeTruthy();
  });
});
