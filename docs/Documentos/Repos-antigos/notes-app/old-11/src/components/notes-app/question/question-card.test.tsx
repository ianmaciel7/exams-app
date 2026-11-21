import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AuthContext } from "@/lib/auth-context";
import {
  caseStudyFixture,
  dropdownFixture,
  makeQuestionObject,
  matrixFixture,
  multipleChoiceFixture,
  orderingFixture,
  simulationFixture,
  singleChoiceFixture,
} from "@/lib/exam/question-fixtures";
import type { Card } from "@/types/card";
import { QuestionAnswerFooter } from "./question-answer-footer";
import { QuestionCard } from "./question-card";
import { QuestionChoiceFieldSet } from "./question-choice-field-set";
import { QuestionChoiceItem } from "./question-choice-item";
import { QuestionDropdownField } from "./question-dropdown-field";
import { QuestionFillBlankField } from "./question-fill-blank-field";
import { QuestionImageFigure } from "./question-image-figure";
import { QuestionResultBadge } from "./question-result-badge";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string, values?: Record<string, unknown>) =>
    values ? `${key}:${JSON.stringify(values)}` : key,
}));

vi.mock("@/lib/firebase/attempts", () => ({
  submitAttempt: vi.fn(),
}));

const dummyCard: Card = {
  id: "c1",
  spaceId: "s1",
  schemaVersion: 4,
  questionId: "q1",
  cardIndex: 0,
  state: 0,
  due: new Date(),
  stability: 0,
  difficulty: 0,
  elapsedDays: 0,
  scheduledDays: 0,
  reps: 0,
  lapses: 0,
  lastReview: null,
  stateVersion: 1,
  updatedAt: new Date(),
};

const question10OrderingFixture = {
  ...orderingFixture,
  prompt: "Place the Cloud Build steps in the correct sequence.",
  items: [
    orderingFixture.items[1],
    orderingFixture.items[0],
    ...orderingFixture.items.slice(2),
  ],
};

function Wrapper({ children }: { children: ReactNode }) {
  return (
    <AuthContext
      value={{
        user: null,
        isLoading: false,
        signOutUser: async () => {},
      }}
    >
      {children}
    </AuthContext>
  );
}

describe("question atomic components", () => {
  afterEach(() => {
    cleanup();
  });

  describe("QuestionImageFigure", () => {
    it("renders fixed ratio container with image and data-slot", () => {
      const { container } = render(
        <QuestionImageFigure
          url="https://example.com/diag.png"
          alt="Architecture diagram"
        />
      );

      const figure = container.querySelector(
        '[data-slot="question-image-figure"]'
      );
      expect(figure).toBeTruthy();
      const img = screen.getByRole("img", { name: "Architecture diagram" });
      expect(img).toBeTruthy();
      expect(img.getAttribute("src")).toBe("https://example.com/diag.png");
    });
  });

  describe("QuestionResultBadge", () => {
    it("renders correct state badge with icon and label", () => {
      render(<QuestionResultBadge state="correct" />);
      const badge = screen
        .getByText("correct")
        .closest('[data-slot="question-result-badge"]');
      expect(badge).toBeTruthy();
      expect(badge?.getAttribute("data-state")).toBe("correct");
    });

    it("renders incorrect state badge with destructive variant and label", () => {
      render(<QuestionResultBadge state="incorrect" />);
      const badge = screen
        .getByText("incorrect")
        .closest('[data-slot="question-result-badge"]');
      expect(badge).toBeTruthy();
      expect(badge?.getAttribute("data-state")).toBe("incorrect");
    });
  });

  describe("QuestionAnswerFooter", () => {
    it("renders action buttons when resolved or unconfirmed", () => {
      const { rerender } = render(
        <QuestionAnswerFooter
          needsConfirmation={true}
          canSubmit={true}
          onSubmit={() => {}}
          onShowAnswer={() => {}}
        />
      );
      expect(screen.getByText("checkAnswer")).toBeTruthy();
      expect(screen.getByText("showAnswer")).toBeTruthy();

      rerender(<QuestionAnswerFooter isResolved={true} onRetry={() => {}} />);
      expect(screen.getByText("tryAgain")).toBeTruthy();
    });

    it("renders children instead of the default actions", () => {
      render(
        <QuestionAnswerFooter needsConfirmation={true}>
          <button type="button">custom action</button>
        </QuestionAnswerFooter>
      );
      expect(screen.getByText("custom action")).toBeTruthy();
      expect(screen.queryByText("showAnswer")).toBeNull();
      expect(screen.queryByText("checkAnswer")).toBeNull();
      expect(
        screen
          .getByText("custom action")
          .closest("[data-slot]")
          ?.getAttribute("data-slot")
      ).toBe("question-answer-footer");
    });
  });

  describe("QuestionChoiceItem", () => {
    it("renders choice item with marker, text and data-slot", () => {
      render(
        <QuestionChoiceItem
          option={{ id: "opt-1", text: "Cloud Storage" }}
          marker="A"
          mode="single"
          inputId="choice-1"
          selected={false}
        />
      );
      const item = screen
        .getByText("Cloud Storage")
        .closest('[data-slot="question-choice-item"]');
      expect(item).toBeTruthy();
      expect(screen.getByText("A.")).toBeTruthy();
    });

    it("triggers selection when clicking the item container", () => {
      render(
        <QuestionChoiceItem
          option={{ id: "opt-1", text: "Cloud Storage" }}
          marker="A"
          mode="single"
          inputId="choice-1"
          selected={false}
        />
      );
      const item = screen
        .getByText("Cloud Storage")
        .closest('[data-slot="question-choice-item"]') as HTMLElement;
      expect(item).toBeTruthy();

      const radio = document.getElementById("choice-1") as HTMLElement;
      const clickSpy = vi.spyOn(radio, "click");

      item.click();
      expect(clickSpy).toHaveBeenCalled();
    });
  });

  describe("QuestionChoiceFieldSet", () => {
    it("renders fieldset with legend and choice items", () => {
      render(
        <QuestionChoiceFieldSet
          legend="Select an option"
          mode="single"
          options={[
            { id: "opt-a", text: "Option A" },
            { id: "opt-b", text: "Option B" },
          ]}
          value={["opt-a"]}
          correctIds={["opt-a"]}
          resolved={false}
          onValueChange={() => {}}
        />
      );
      expect(
        screen
          .getByText("Select an option")
          .closest('[data-slot="question-choice-field-set"]')
      ).toBeTruthy();
      expect(screen.getByText("Option A")).toBeTruthy();
      expect(screen.getByText("Option B")).toBeTruthy();
    });
  });

  describe("QuestionFillBlankField (wrapper)", () => {
    it("renders fill blank field with label and input", () => {
      render(
        <QuestionFillBlankField
          value="my answer"
          acceptedAnswers={["correct answer"]}
          resolved={false}
          onValueChange={() => {}}
        />
      );
      expect(screen.getByText("fillBlankLabel")).toBeTruthy();
      expect(screen.getByDisplayValue("my answer")).toBeTruthy();
    });
  });

  describe("QuestionDropdownField", () => {
    it("renders dropdown field with select and options", () => {
      render(
        <QuestionDropdownField
          dropdown={{
            id: "dd-1",
            label: "Select Region",
            options: [
              { id: "us-central1", text: "Iowa" },
              { id: "europe-west1", text: "Belgium" },
            ],
          }}
          value="us-central1"
          resolved={false}
          onValueChange={() => {}}
        />
      );
      expect(
        screen
          .getByText("Select Region")
          .closest('[data-slot="question-dropdown-field"]')
      ).toBeTruthy();
    });
  });

  describe("QuestionCard atomic integration across question patterns", () => {
    it("renders single-choice question card", () => {
      render(
        <Wrapper>
          <QuestionCard
            spaceId="space-1"
            question={makeQuestionObject(singleChoiceFixture, "q-sc")}
            card={dummyCard}
            index={0}
            total={5}
          />
        </Wrapper>
      );
      expect(
        screen.getAllByText(
          "Which service runs stateless containers without servers?"
        ).length
      ).toBeGreaterThan(0);
    });

    it("renders dropdown question card", () => {
      render(
        <Wrapper>
          <QuestionCard
            spaceId="space-1"
            question={makeQuestionObject(dropdownFixture, "q-dd")}
            card={dummyCard}
            index={1}
            total={5}
          />
        </Wrapper>
      );
      expect(screen.getAllByText("dropdownPlaceholder").length).toBeGreaterThan(
        0
      );
    });

    it("renders ordering question card", () => {
      render(
        <Wrapper>
          <QuestionCard
            spaceId="space-1"
            question={makeQuestionObject(orderingFixture, "q-ord")}
            card={dummyCard}
            index={2}
            total={5}
          />
        </Wrapper>
      );
      expect(screen.getByText("Commit Code")).toBeTruthy();
    });

    it("auto-checks multiple-choice after the expected selections", () => {
      render(
        <Wrapper>
          <QuestionCard
            spaceId="space-1"
            question={makeQuestionObject(multipleChoiceFixture, "q2")}
            card={null}
            index={1}
            total={12}
          />
        </Wrapper>
      );

      expect(screen.queryByText("checkAnswer")).toBeNull();
      fireEvent.click(
        screen
          .getByText("Cloud Run")
          .closest('[data-slot="question-choice-item"]') as HTMLElement
      );
      fireEvent.click(
        screen
          .getByText("Cloud Functions")
          .closest('[data-slot="question-choice-item"]') as HTMLElement
      );

      expect(
        screen
          .getAllByText("Select every serverless product.")[0]
          .closest('[data-slot="question-card"]')
          ?.getAttribute("data-status")
      ).toBe("answeredCorrect");
    });

    it("checks the corrected ordering answer", () => {
      render(
        <Wrapper>
          <QuestionCard
            spaceId="space-1"
            question={makeQuestionObject(question10OrderingFixture, "q10")}
            card={null}
            index={9}
            total={12}
          />
        </Wrapper>
      );

      fireEvent.click(
        screen.getByRole("button", { name: "Move Run Tests up" })
      );
      fireEvent.click(screen.getByRole("button", { name: "checkAnswer" }));

      expect(screen.getByText("correct")).toBeTruthy();
    });

    it("renders matrix question card", () => {
      render(
        <Wrapper>
          <QuestionCard
            spaceId="space-1"
            question={makeQuestionObject(matrixFixture, "q-mat")}
            card={dummyCard}
            index={3}
            total={5}
          />
        </Wrapper>
      );
      expect(
        screen.getByText("Cloud Run can scale to zero instances.")
      ).toBeTruthy();
    });

    it("renders simulation question card", () => {
      render(
        <Wrapper>
          <QuestionCard
            spaceId="space-1"
            question={makeQuestionObject(simulationFixture, "q-sim")}
            card={dummyCard}
            index={4}
            total={5}
          />
        </Wrapper>
      );
      expect(screen.getByText("simulationTitle")).toBeTruthy();
    });

    it("renders the case-study questions heading only when it has parts", () => {
      const renderCaseStudy = (parts: typeof caseStudyFixture.parts) =>
        render(
          <Wrapper>
            <QuestionCard
              spaceId="space-1"
              question={makeQuestionObject(
                { ...caseStudyFixture, parts, correctAnswer: {} },
                "q-cs"
              )}
              card={dummyCard}
              index={5}
              total={6}
            />
          </Wrapper>
        );

      const withParts = renderCaseStudy(caseStudyFixture.parts);
      expect(screen.getByText("caseStudyQuestions")).toBeTruthy();
      withParts.unmount();

      renderCaseStudy([]);
      expect(screen.getByText("Acme migration")).toBeTruthy();
      expect(screen.queryByText("caseStudyQuestions")).toBeNull();
    });
  });
});
