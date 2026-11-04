import { cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  recordUsage: vi.fn().mockResolvedValue(undefined),
  user: null as { uid: string } | null,
  pathname: "/profile",
}));

vi.mock("next/navigation", () => ({
  usePathname: () => mocks.pathname,
}));

vi.mock("@/hooks/use-session", () => ({
  useSession: () => ({ user: mocks.user }),
}));

vi.mock("@/lib/firebase/usage", () => ({
  recordUsage: mocks.recordUsage,
}));

import { RouteUsageBridgeClient } from "./route-usage-bridge-client";

describe("RouteUsageBridgeClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.user = null;
    mocks.pathname = "/profile";
  });

  afterEach(cleanup);

  it("does not record telemetry when there is no authenticated user", () => {
    render(<RouteUsageBridgeClient />);
    expect(mocks.recordUsage).not.toHaveBeenCalled();
  });

  it("records screen view telemetry when a user is authenticated", () => {
    mocks.user = { uid: "user-1" };
    render(<RouteUsageBridgeClient />);
    expect(mocks.recordUsage).toHaveBeenCalledWith({
      type: "screen_view",
      name: "/profile",
    });
  });
});
