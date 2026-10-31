import { act, cleanup, render, screen } from "@testing-library/react";
import type { User } from "firebase/auth";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AuthenticatedUserContext } from "../_lib/authenticated-user";
import { RouteUsageClient } from "./route-usage-client";

const mocks = vi.hoisted(() => ({
  recordUsage: vi.fn(),
  pathname: "/profile",
}));

vi.mock("next/navigation", () => ({ usePathname: () => mocks.pathname }));
vi.mock("@/lib/firebase/usage", () => ({ recordUsage: mocks.recordUsage }));

function Usage({ uid = "user-123" }: { uid?: string }) {
  return (
    <AuthenticatedUserContext key={uid} value={{ uid } as User}>
      <RouteUsageClient>
        <div>{"Protected Content"}</div>
      </RouteUsageClient>
    </AuthenticatedUserContext>
  );
}

describe("RouteUsageClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.pathname = "/profile";
    mocks.recordUsage.mockResolvedValue(undefined);
  });

  afterEach(cleanup);

  it("records the current route without blocking its content", () => {
    mocks.recordUsage.mockReturnValue(new Promise(() => {}));
    render(<Usage />);
    expect(screen.getByText("Protected Content")).toBeTruthy();
    expect(mocks.recordUsage).toHaveBeenCalledWith({
      type: "screen_view",
      name: "/profile",
    });
  });

  it("keeps content visible when usage logging fails", async () => {
    mocks.recordUsage.mockRejectedValue(new Error("offline"));
    render(<Usage />);
    await act(async () => {});
    expect(screen.queryByRole("alert")).toBeNull();
    expect(screen.getByText("Protected Content")).toBeTruthy();
  });

  it("records one view per render of the same user and path", () => {
    const { rerender } = render(<Usage />);
    rerender(<Usage />);
    expect(mocks.recordUsage).toHaveBeenCalledOnce();
  });

  it("records a new view on navigation and on an account switch", () => {
    const { rerender } = render(<Usage />);
    mocks.pathname = "/profile/security";
    rerender(<Usage />);
    expect(mocks.recordUsage).toHaveBeenLastCalledWith({
      type: "screen_view",
      name: "/profile/security",
    });
    rerender(<Usage uid="user-456" />);
    expect(mocks.recordUsage).toHaveBeenCalledTimes(3);
  });
});
