import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import ExamPage from "./page";

vi.mock("@/components/notes-app/require-auth", () => ({
  RequireAuth: ({
    children,
    redirectTo,
  }: {
    children: React.ReactNode;
    redirectTo?: string;
  }) => (
    <div data-testid="require-auth" data-redirect-to={redirectTo}>
      {children}
    </div>
  ),
}));
vi.mock("@/components/notes-app/space-shell", () => ({
  SpaceShell: ({
    children,
    currentSpaceId,
  }: {
    children: React.ReactNode;
    currentSpaceId: string;
  }) => (
    <div data-testid="space-shell" data-space-id={currentSpaceId}>
      {children}
    </div>
  ),
}));
vi.mock("@/components/notes-app/exam-list", () => ({
  ExamList: ({ spaceId, examId }: { spaceId: string; examId: string }) => (
    <div data-testid="exam-list">{`${spaceId}/${examId}`}</div>
  ),
}));

describe("ExamPage", () => {
  afterEach(cleanup);

  it("awaits params and renders the feed inside the authenticated shell", async () => {
    const ui = await ExamPage({
      params: Promise.resolve({ spaceId: "space-1", examId: "exam-9" }),
    } as never);
    render(ui);

    expect(
      screen.getByTestId("require-auth").getAttribute("data-redirect-to")
    ).toBe(`/login?next=${encodeURIComponent("/space-1/exams/exam-9")}`);
    expect(
      screen.getByTestId("space-shell").getAttribute("data-space-id")
    ).toBe("space-1");
    expect(screen.getByTestId("exam-list").textContent).toBe("space-1/exam-9");
  });
});
