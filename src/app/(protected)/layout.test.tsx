import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import ProtectedLayout from "./layout";

const mocks = vi.hoisted(() => ({ verify: vi.fn() }));

vi.mock("@/lib/dal", () => ({ verifySession: mocks.verify }));
vi.mock("./_components/navigation-events", () => ({
  NavigationEvents: () => <div data-testid="route-usage" />,
}));

afterEach(cleanup);

describe("ProtectedLayout", () => {
  it("verifies the session via the DAL before rendering the layout and children", async () => {
    mocks.verify.mockResolvedValue({ role: "user", userId: "u1" });

    render(
      await ProtectedLayout({
        params: Promise.resolve({}),
        children: <p>{"Protected Content"}</p>,
      }),
    );
    expect(mocks.verify).toHaveBeenCalledOnce();
    expect(screen.getByTestId("route-usage")).toBeTruthy();
    expect(screen.getByText("Protected Content")).toBeTruthy();
  });
});
