import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import ProfilePage from "./profile/page";

vi.mock("next-intl/server", () => ({
  getTranslations: async () => (key: string) => key,
}));

vi.mock("./profile/_components/profile-client", () => ({
  ProfileClient: ({
    title,
    description,
  }: {
    title: string;
    description: string;
  }) => (
    <main data-testid="profile-client">
      <h1>{title}</h1>
      <p>{description}</p>
    </main>
  ),
}));

afterEach(cleanup);

describe("protected routes", () => {
  it("renders profile route composition root", async () => {
    render(await ProfilePage());
    expect(screen.getByTestId("profile-client")).toBeTruthy();
    expect(
      screen.getByRole("heading", { name: "personalInfoTitle" }),
    ).toBeTruthy();
    expect(screen.getByText("personalInfoDescription")).toBeTruthy();
  });
});
