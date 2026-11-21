import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { UseExamListResult } from "@/hooks/use-exam-list";
import type { QuestionObject } from "@/types/object";
import { ExamList } from "./exam-list";

const mockUseExamList = vi.fn<() => UseExamListResult>();

vi.mock("@/hooks/use-exam-list", () => ({
  useExamList: () => mockUseExamList(),
}));
vi.mock("@/components/notes-app/question/question-card", () => ({
  QuestionCard: ({
    question,
    index,
  }: {
    question: QuestionObject;
    index: number;
  }) => <div data-testid="question-card">{`${index}:${question.id}`}</div>,
}));
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

const scrollToTop = vi.fn();

function state(overrides: Partial<UseExamListResult> = {}): UseExamListResult {
  return {
    questions: [],
    cardsByQuestionId: new Map(),
    loading: false,
    error: null,
    showScrollToTop: false,
    scrollToTop,
    ...overrides,
  };
}

describe("ExamList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  afterEach(cleanup);

  it("shows the loading status", () => {
    mockUseExamList.mockReturnValue(state({ loading: true }));
    render(<ExamList spaceId="s1" examId="e1" />);
    expect(screen.getByText("loading")).toBeTruthy();
    expect(screen.queryByText("empty")).toBeNull();
  });

  it("shows the empty state when there are no questions", () => {
    mockUseExamList.mockReturnValue(state());
    render(<ExamList spaceId="s1" examId="e1" />);
    expect(screen.getByText("empty")).toBeTruthy();
  });

  it("shows an error alert and hides the empty state", () => {
    mockUseExamList.mockReturnValue(state({ error: new Error("denied") }));
    render(<ExamList spaceId="s1" examId="e1" />);
    expect(screen.getByRole("alert").textContent).toBe("denied");
    expect(screen.queryByText("empty")).toBeNull();
  });

  it("renders one card per question in order", () => {
    mockUseExamList.mockReturnValue(
      state({
        questions: [{ id: "q1" }, { id: "q2" }] as QuestionObject[],
      })
    );
    render(<ExamList spaceId="s1" examId="e1" />);
    const cards = screen.getAllByTestId("question-card");
    expect(cards.map((c) => c.textContent)).toEqual(["0:q1", "1:q2"]);
    expect(screen.queryByLabelText("scrollToTop")).toBeNull();
  });

  it("shows the scroll-to-top button and wires its click", () => {
    mockUseExamList.mockReturnValue(state({ showScrollToTop: true }));
    render(<ExamList spaceId="s1" examId="e1" />);
    fireEvent.click(screen.getByLabelText("scrollToTop"));
    expect(scrollToTop).toHaveBeenCalledTimes(1);
  });
});
