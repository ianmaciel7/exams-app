import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import ProfilePage from "./profile/page";

vi.mock("./_lib/dal", () => ({
  verifySession: async () => ({ role: "user", userId: "test-user" }),
}));

// Async Server Components cannot render in jsdom; the stand-in echoes the key.
vi.mock("@/components/ui/extensions/translation-text-server", () => ({
  TranslationTextServer: ({ message }: { message: string }) =>
    message.split(".").pop(),
}));

vi.mock("./profile/_components/profile-form", () => ({
  ProfileForm: () => <div data-testid="profile-form" />,
}));

afterEach(cleanup);

describe("protected routes", () => {
  it("renders profile route composition root", async () => {
    render(await ProfilePage());
    expect(screen.getByTestId("profile-form")).toBeTruthy();
    expect(
      screen.getByRole("heading", { name: "personalInfoTitle" }),
    ).toBeTruthy();
    expect(screen.getByText("personalInfoDescription")).toBeTruthy();
  });
});
