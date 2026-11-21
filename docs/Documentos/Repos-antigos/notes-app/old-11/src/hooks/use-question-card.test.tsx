import { act, renderHook, waitFor } from "@testing-library/react";
import type { User } from "firebase/auth";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthContext } from "@/lib/auth-context";
import {
  caseStudyFixture,
  dragAndDropFixture,
  dropdownFixture,
  fillBlankFixture,
  hotspotFixture,
  makeQuestionObject,
  matchingFixture,
  matrixFixture,
  multipleChoiceFixture,
  orderingFixture,
  simulationFixture,
  singleChoiceFixture,
  trueFalseFixture,
} from "@/lib/exam/question-fixtures";
import type { Card } from "@/types/card";
import type { QuestionProperties, SubmittedAnswer } from "@/types/question";
import { useQuestionCard } from "./use-question-card";

const mockSubmitAttempt = vi.fn();

vi.mock("@/lib/firebase/attempts", () => ({
  submitAttempt: (...args: unknown[]) => mockSubmitAttempt(...args),
}));

const now = new Date("2026-10-03T12:00:00Z");

const card: Card = {
  id: "c1",
  spaceId: "s1",
  schemaVersion: 4,
  questionId: "q1",
  cardIndex: 0,
  state: 0,
  due: now,
  stability: 0,
  difficulty: 0,
  elapsedDays: 0,
  scheduledDays: 0,
  reps: 0,
  lapses: 0,
  lastReview: null,
  stateVersion: 1,
  updatedAt: now,
};

function wrapperFor(user: Pick<User, "uid"> | null) {
  return ({ children }: { children: ReactNode }) => (
    <AuthContext
      value={{
        user: user as User | null,
        isLoading: false,
        signOutUser: async () => {},
      }}
    >
      {children}
    </AuthContext>
  );
}

function renderCard(
  properties: QuestionProperties = singleChoiceFixture,
  options: { user?: Pick<User, "uid"> | null; card?: Card | null } = {}
) {
  const { user = { uid: "u1" }, card: companion = card } = options;
  return renderHook(
    () =>
      useQuestionCard({
        spaceId: "s1",
        question: makeQuestionObject(properties),
        card: companion,
      }),
    { wrapper: wrapperFor(user) }
  );
}

describe("useQuestionCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSubmitAttempt.mockResolvedValue("attempt-1");
  });

  it("starts unanswered", () => {
    const { result } = renderCard();
    expect(result.current.status).toBe("unanswered");
    expect(result.current.answer).toBeNull();
    expect(result.current.isResolved).toBe(false);
    expect(result.current.needsConfirmation).toBe(false);
  });

  it("grades a correct single-choice click instantly and logs the submitted answer", async () => {
    const { result } = renderCard();

    await act(async () => {
      result.current.setAnswer({ type: "single-choice", value: "b" });
    });

    expect(result.current.status).toBe("answeredCorrect");
    expect(result.current.answer).toEqual({
      type: "single-choice",
      value: "b",
    });
    expect(mockSubmitAttempt).toHaveBeenCalledTimes(1);
    expect(mockSubmitAttempt.mock.calls[0][0]).toMatchObject({
      userId: "u1",
      spaceId: "s1",
      card,
      input: {
        questionId: "q1",
        cardId: "c1",
        rating: 3,
        reviewMode: "review",
        questionType: "single-choice",
        submittedAnswer: { type: "single-choice", value: "b" },
        isCorrect: true,
      },
    });
  });

  it("grades an incorrect click with rating Forgot", async () => {
    const { result } = renderCard();

    await act(async () => {
      result.current.setAnswer({ type: "single-choice", value: "a" });
    });

    expect(result.current.status).toBe("answeredIncorrect");
    expect(mockSubmitAttempt.mock.calls[0][0].input).toMatchObject({
      rating: 1,
      isCorrect: false,
    });
  });

  it("grades true-false instantly", async () => {
    const { result } = renderCard(trueFalseFixture);

    await act(async () => {
      result.current.setAnswer({ type: "true-false", value: "true" });
    });

    expect(result.current.status).toBe("answeredCorrect");
  });

  it("ignores further answers once resolved", async () => {
    const { result } = renderCard();

    await act(async () => {
      result.current.setAnswer({ type: "single-choice", value: "a" });
    });
    await act(async () => {
      result.current.setAnswer({ type: "single-choice", value: "b" });
    });

    expect(result.current.answer).toEqual({
      type: "single-choice",
      value: "a",
    });
    expect(mockSubmitAttempt).toHaveBeenCalledTimes(1);
  });

  it("grades multiple-choice automatically after enough options are selected", async () => {
    const { result } = renderCard(multipleChoiceFixture);
    expect(result.current.needsConfirmation).toBe(false);
    expect(result.current.canSubmit).toBe(false);

    act(() => {
      result.current.setAnswer({ type: "multiple-choice", value: ["a"] });
    });
    expect(result.current.status).toBe("unanswered");
    expect(result.current.canSubmit).toBe(true);
    expect(mockSubmitAttempt).not.toHaveBeenCalled();

    act(() => {
      result.current.setAnswer({ type: "multiple-choice", value: ["a", "c"] });
    });
    await waitFor(() => expect(result.current.status).toBe("answeredCorrect"));

    expect(mockSubmitAttempt.mock.calls[0][0].input.submittedAnswer).toEqual({
      type: "multiple-choice",
      value: ["a", "c"],
    });
  });

  it.each([
    [
      "ordering",
      orderingFixture,
      { type: "ordering", value: ["step1", "step2", "step3"] },
    ],
    [
      "simulation",
      simulationFixture,
      {
        type: "simulation",
        value: ["gcloud run deploy my-app --image gcr.io/demo/app"],
      },
    ],
  ] as const)("grades %s after confirmation", async (_type, properties, answer) => {
    const { result } = renderCard(properties);

    expect(result.current.needsConfirmation).toBe(true);
    expect(result.current.canSubmit).toBe(false);

    act(() => {
      result.current.setAnswer(answer as unknown as SubmittedAnswer);
    });
    expect(result.current.canSubmit).toBe(true);
    expect(result.current.status).toBe("unanswered");

    await act(async () => {
      result.current.submit();
    });

    expect(result.current.status).toBe("answeredCorrect");
    expect(mockSubmitAttempt).toHaveBeenCalledWith(
      expect.objectContaining({
        input: expect.objectContaining({
          questionType: properties.type,
          submittedAnswer: answer,
          isCorrect: true,
        }),
      })
    );
  });

  it("grades matching automatically after every pair is selected", async () => {
    const { result } = renderCard(matchingFixture);

    expect(result.current.needsConfirmation).toBe(false);

    act(() => {
      result.current.setAnswer({ type: "matching", value: { l1: "r1" } });
    });
    expect(result.current.status).toBe("unanswered");
    expect(mockSubmitAttempt).not.toHaveBeenCalled();

    act(() => {
      result.current.setAnswer({
        type: "matching",
        value: { l1: "r1", l2: "r2" },
      });
    });

    await waitFor(() => expect(result.current.status).toBe("answeredCorrect"));
    expect(mockSubmitAttempt).toHaveBeenCalledTimes(1);
  });

  it("grades drag-and-drop automatically after every slot is filled", async () => {
    const { result } = renderCard(dragAndDropFixture);

    expect(result.current.needsConfirmation).toBe(false);
    act(() => {
      result.current.setAnswer({
        type: "drag-and-drop",
        value: { s1: "i1", s2: "i2" },
      });
    });

    await waitFor(() => expect(result.current.status).toBe("answeredCorrect"));
    expect(mockSubmitAttempt).toHaveBeenCalledTimes(1);
  });

  it("grades hotspot automatically after the expected area is selected", async () => {
    const { result } = renderCard(hotspotFixture);

    expect(result.current.needsConfirmation).toBe(false);
    act(() => {
      result.current.setAnswer({ type: "hotspot", value: ["lb"] });
    });

    await waitFor(() => expect(result.current.status).toBe("answeredCorrect"));
    expect(mockSubmitAttempt).toHaveBeenCalledTimes(1);
  });

  it("grades dropdown automatically after every menu is filled", async () => {
    const { result } = renderCard(dropdownFixture);

    expect(result.current.needsConfirmation).toBe(false);
    act(() => {
      result.current.setAnswer({
        type: "dropdown",
        value: { dd1: "cs", dd2: "csql" },
      });
    });

    await waitFor(() => expect(result.current.status).toBe("answeredCorrect"));
    expect(mockSubmitAttempt).toHaveBeenCalledTimes(1);
  });

  it("grades a case study automatically after every part is answered", async () => {
    const { result } = renderCard(caseStudyFixture);

    expect(result.current.needsConfirmation).toBe(false);
    act(() => {
      result.current.setAnswer({
        type: "case-study",
        value: { p1: "a", p2: "pay per use" },
      });
    });

    await waitFor(() => expect(result.current.status).toBe("answeredCorrect"));
    expect(mockSubmitAttempt).toHaveBeenCalledTimes(1);
  });

  it("grades matrix automatically after every row is answered", async () => {
    const { result } = renderCard(matrixFixture);

    expect(result.current.needsConfirmation).toBe(false);
    act(() => {
      result.current.setAnswer({
        type: "matrix",
        value: { r1: "col_true", r2: "col_false" },
      });
    });

    await waitFor(() => expect(result.current.status).toBe("answeredCorrect"));
    expect(mockSubmitAttempt).toHaveBeenCalledTimes(1);
  });

  it("does not submit an incomplete answer", async () => {
    const { result } = renderCard(fillBlankFixture);

    act(() => {
      result.current.setAnswer({ type: "fill-blank", value: "   " });
    });
    await act(async () => {
      result.current.submit();
    });

    expect(result.current.canSubmit).toBe(false);
    expect(result.current.status).toBe("unanswered");
    expect(mockSubmitAttempt).not.toHaveBeenCalled();
  });

  it("grades fill-blank ignoring case and spacing", async () => {
    const { result } = renderCard(fillBlankFixture);

    act(() => {
      result.current.setAnswer({ type: "fill-blank", value: "  CLOUD   run " });
    });
    await act(async () => {
      result.current.submit();
    });

    expect(result.current.status).toBe("answeredCorrect");
  });

  it("starts structured types from an empty draft", () => {
    expect(renderCard(hotspotFixture).result.current.answer).toEqual({
      type: "hotspot",
      value: [],
    });
    expect(renderCard(caseStudyFixture).result.current.answer).toEqual({
      type: "case-study",
      value: {},
    });
  });

  it("shows the explanation only after resolution and only when present", async () => {
    const { result } = renderCard();
    expect(result.current.showExplanation).toBe(false);

    await act(async () => {
      result.current.setAnswer({ type: "single-choice", value: "b" });
    });
    expect(result.current.showExplanation).toBe(true);

    const bare = renderCard({ ...singleChoiceFixture, explanation: undefined });
    await act(async () => {
      bare.result.current.setAnswer({ type: "single-choice", value: "b" });
    });
    expect(bare.result.current.showExplanation).toBe(false);
  });

  it("reveals the answer without logging an attempt", () => {
    const { result } = renderCard();

    act(() => {
      result.current.showAnswer();
    });
    expect(result.current.status).toBe("revealed");
    expect(result.current.isResolved).toBe(true);

    act(() => {
      result.current.showAnswer();
    });
    expect(mockSubmitAttempt).not.toHaveBeenCalled();
  });

  it("treats a case study without parts as reveal-only", () => {
    const { result } = renderCard({
      ...caseStudyFixture,
      parts: [],
      correctAnswer: {},
    });

    expect(result.current.isGradable).toBe(false);
    expect(result.current.needsConfirmation).toBe(false);

    act(() => {
      result.current.setAnswer({ type: "case-study", value: {} });
    });
    expect(result.current.status).toBe("unanswered");
    expect(mockSubmitAttempt).not.toHaveBeenCalled();
  });

  it("grades locally without writing when there is no companion card or user", async () => {
    const noCard = renderCard(singleChoiceFixture, { card: null });
    await act(async () => {
      noCard.result.current.setAnswer({ type: "single-choice", value: "b" });
    });
    expect(noCard.result.current.status).toBe("answeredCorrect");

    const noUser = renderCard(singleChoiceFixture, { user: null });
    await act(async () => {
      noUser.result.current.setAnswer({ type: "single-choice", value: "a" });
    });
    expect(noUser.result.current.status).toBe("answeredIncorrect");
    expect(mockSubmitAttempt).not.toHaveBeenCalled();
  });

  it("keeps the answer and flags an error when the write fails", async () => {
    mockSubmitAttempt.mockRejectedValue(new Error("offline"));
    const { result } = renderCard();

    await act(async () => {
      result.current.setAnswer({ type: "single-choice", value: "b" });
    });

    await waitFor(() => expect(result.current.hasSaveError).toBe(true));
    expect(result.current.status).toBe("unanswered");
    expect(result.current.answer).toEqual({
      type: "single-choice",
      value: "b",
    });
    expect(result.current.isSubmitting).toBe(false);
  });

  it("retry starts a new attempt without erasing the earlier one", async () => {
    const { result } = renderCard();

    await act(async () => {
      result.current.setAnswer({ type: "single-choice", value: "a" });
    });
    expect(result.current.status).toBe("answeredIncorrect");

    act(() => {
      result.current.retry();
    });
    expect(result.current.status).toBe("unanswered");
    expect(result.current.answer).toBeNull();

    await act(async () => {
      result.current.setAnswer({ type: "single-choice", value: "b" });
    });
    expect(result.current.status).toBe("answeredCorrect");
    expect(mockSubmitAttempt).toHaveBeenCalledTimes(2);
    expect(
      mockSubmitAttempt.mock.calls.map((call) => call[0].input.submittedAnswer)
    ).toEqual([
      { type: "single-choice", value: "a" },
      { type: "single-choice", value: "b" },
    ]);
  });

  it("retry is a no-op before the question is resolved", () => {
    const { result } = renderCard();
    act(() => {
      result.current.retry();
    });
    expect(result.current.status).toBe("unanswered");
  });
});
