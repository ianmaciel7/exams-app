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

const snapshot = vi.hoisted(() => ({
  photoURL: null,
  values: {
    displayName: "Ada",
    email: "ada@example.com",
    locale: "en",
    theme: "system",
  },
}));

// The page reads on the server (Admin SDK) and injects the Server Action.
vi.mock("./profile/_lib/data", () => ({
  readOwnProfile: async () => snapshot,
}));

vi.mock("./profile/_lib/actions", () => ({ updateProfile: vi.fn() }));

vi.mock("./profile/_components/profile-form", () => ({
  ProfileForm: ({ initialValues }: { initialValues: typeof snapshot }) => (
    <div data-testid="profile-form">{initialValues.values.displayName}</div>
  ),
}));

afterEach(cleanup);

describe("protected routes", () => {
  it("renders profile route composition root", async () => {
    render(await ProfilePage());
    expect(screen.getByTestId("profile-form").textContent).toBe("Ada");
    expect(
      screen.getByRole("heading", { name: "personalInfoTitle" }),
    ).toBeTruthy();
    expect(screen.getByText("personalInfoDescription")).toBeTruthy();
  });
});
