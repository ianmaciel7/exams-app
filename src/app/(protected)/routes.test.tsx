import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import ProfilePage from "./profile/page";

vi.mock("./_lib/dal", () => ({
  verifySession: async () => ({ role: "user", userId: "test-user" }),
}));

vi.mock("next-intl/server", () => ({
  getTranslations: async () => (key: string) => key,
}));

vi.mock("./profile/_components/profile-form-client", () => ({
  ProfileFormClient: () => <div data-testid="profile-form-client" />,
}));

afterEach(cleanup);

describe("protected routes", () => {
  it("renders profile route composition root", async () => {
    render(await ProfilePage());
    expect(screen.getByTestId("profile-form-client")).toBeTruthy();
    expect(
      screen.getByRole("heading", { name: "personalInfoTitle" }),
    ).toBeTruthy();
    expect(screen.getByText("personalInfoDescription")).toBeTruthy();
  });
});
