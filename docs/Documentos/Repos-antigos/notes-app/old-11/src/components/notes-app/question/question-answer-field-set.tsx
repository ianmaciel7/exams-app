"use client";

import type { ComponentProps, ReactNode } from "react";
import { QuestionCaseStudyFieldSet } from "@/components/notes-app/question/question-case-study-field-set";
import { QuestionCaseStudyTabs } from "@/components/notes-app/question/question-case-study-tabs";
import { QuestionChoiceFieldSet } from "@/components/notes-app/question/question-choice-field-set";
import { QuestionDraggableFieldSet } from "@/components/notes-app/question/question-draggable-field-set";
import { QuestionDropdownFieldGroup } from "@/components/notes-app/question/question-dropdown-field-group";
import { QuestionFillBlankField } from "@/components/notes-app/question/question-fill-blank-field";
import { QuestionHotspotFieldSet } from "@/components/notes-app/question/question-hotspot-field-set";
import { QuestionMatchingFieldSet } from "@/components/notes-app/question/question-matching-field-set";
import { QuestionMatrixFieldSet } from "@/components/notes-app/question/question-matrix-field-set";
import { QuestionOrderingFieldSet } from "@/components/notes-app/question/question-ordering-field-set";
import { QuestionSimulationFieldSet } from "@/components/notes-app/question/question-simulation-field-set";
import { FieldSet } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import type {
  CaseStudyPart,
  CaseStudyPartAnswer,
  QuestionProperties,
  QuestionPropertiesOf,
  SubmittedAnswer,
  TrueFalseValue,
} from "@/types/question";

type QuestionAnswerFieldSetProps = Omit<
  ComponentProps<typeof FieldSet>,
  "children" | "onChange"
> & {
  question: QuestionProperties;
  /** The draft while answering and the submitted answer once graded. */
  answer: SubmittedAnswer | null;
  /** True once graded or revealed: marks the key and locks the controls. */
  resolved: boolean;
  onAnswerChange: (answer: SubmittedAnswer) => void;
};

function isTrueFalse(value: string | undefined): value is TrueFalseValue {
  return value === "true" || value === "false";
}

type Context = Pick<
  QuestionAnswerFieldSetProps,
  "answer" | "resolved" | "onAnswerChange"
>;

function choiceAnswer(
  question: QuestionPropertiesOf<"single-choice" | "true-false">,
  { answer, resolved, onAnswerChange }: Context
): ReactNode {
  const current = answer?.type === question.type ? answer.value : "";
  return (
    <QuestionChoiceFieldSet
      legend={question.prompt}
      mode="single"
      options={question.options}
      value={current ? [current] : []}
      correctIds={[question.correctAnswer]}
      resolved={resolved}
      onValueChange={([id]) => {
        if (question.type === "true-false" && isTrueFalse(id)) {
          onAnswerChange({ type: "true-false", value: id });
        } else if (question.type === "single-choice" && id) {
          onAnswerChange({ type: "single-choice", value: id });
        }
      }}
    />
  );
}

function multipleChoiceAnswer(
  question: QuestionPropertiesOf<"multiple-choice">,
  { answer, resolved, onAnswerChange }: Context
): ReactNode {
  return (
    <QuestionChoiceFieldSet
      legend={question.prompt}
      mode="multiple"
      options={question.options}
      value={answer?.type === "multiple-choice" ? answer.value : []}
      correctIds={question.correctAnswer}
      resolved={resolved}
      onValueChange={(value) => onAnswerChange({ type: question.type, value })}
    />
  );
}

function fillBlankAnswer(
  question: QuestionPropertiesOf<"fill-blank">,
  { answer, resolved, onAnswerChange }: Context
): ReactNode {
  return (
    <QuestionFillBlankField
      value={answer?.type === "fill-blank" ? answer.value : ""}
      acceptedAnswers={question.correctAnswer}
      resolved={resolved}
      onValueChange={(value) => onAnswerChange({ type: question.type, value })}
    />
  );
}

function matchingAnswer(
  question: QuestionPropertiesOf<"matching">,
  { answer, resolved, onAnswerChange }: Context
): ReactNode {
  return (
    <QuestionMatchingFieldSet
      legend={question.prompt}
      leftItems={question.leftItems}
      rightItems={question.rightItems}
      value={answer?.type === "matching" ? answer.value : {}}
      correctAnswer={question.correctAnswer}
      resolved={resolved}
      onValueChange={(value) => onAnswerChange({ type: question.type, value })}
    />
  );
}

function dragAndDropAnswer(
  question: QuestionPropertiesOf<"drag-and-drop">,
  { answer, resolved, onAnswerChange }: Context
): ReactNode {
  return (
    <QuestionDraggableFieldSet
      legend={question.prompt}
      items={question.items}
      slots={question.slots}
      value={answer?.type === "drag-and-drop" ? answer.value : {}}
      correctAnswer={question.correctAnswer}
      resolved={resolved}
      onValueChange={(value) => onAnswerChange({ type: question.type, value })}
    />
  );
}

function hotspotAnswer(
  question: QuestionPropertiesOf<"hotspot">,
  { answer, resolved, onAnswerChange }: Context
): ReactNode {
  return (
    <QuestionHotspotFieldSet
      legend={question.prompt}
      image={question.image}
      areas={question.areas}
      value={answer?.type === "hotspot" ? answer.value : []}
      correctIds={question.correctAnswer}
      resolved={resolved}
      onValueChange={(value) => onAnswerChange({ type: question.type, value })}
    />
  );
}

function dropdownAnswer(
  question: QuestionPropertiesOf<"dropdown">,
  { answer, resolved, onAnswerChange }: Context
): ReactNode {
  return (
    <QuestionDropdownFieldGroup
      legend={question.prompt}
      dropdowns={question.dropdowns}
      value={answer?.type === "dropdown" ? answer.value : {}}
      correctAnswer={question.correctAnswer}
      resolved={resolved}
      onValueChange={(value) => onAnswerChange({ type: question.type, value })}
    />
  );
}

function matrixAnswer(
  question: QuestionPropertiesOf<"matrix">,
  { answer, resolved, onAnswerChange }: Context
): ReactNode {
  return (
    <QuestionMatrixFieldSet
      legend={question.prompt}
      columns={question.columns}
      rows={question.rows}
      value={answer?.type === "matrix" ? answer.value : {}}
      correctAnswer={question.correctAnswer}
      resolved={resolved}
      onValueChange={(value) => onAnswerChange({ type: question.type, value })}
    />
  );
}

function orderingAnswer(
  question: QuestionPropertiesOf<"ordering">,
  { answer, resolved, onAnswerChange }: Context
): ReactNode {
  return (
    <QuestionOrderingFieldSet
      legend={question.prompt}
      items={question.items}
      value={answer?.type === "ordering" ? answer.value : []}
      correctAnswer={question.correctAnswer}
      resolved={resolved}
      onValueChange={(value) => onAnswerChange({ type: question.type, value })}
    />
  );
}

function simulationAnswer(
  question: QuestionPropertiesOf<"simulation">,
  { answer, resolved, onAnswerChange }: Context
): ReactNode {
  return (
    <QuestionSimulationFieldSet
      legend={question.prompt}
      scenarioDescription={question.scenarioDescription}
      terminalPrompt={question.terminalPrompt}
      allowedCommands={question.allowedCommands}
      correctAnswer={question.correctAnswer}
      value={answer?.type === "simulation" ? answer.value : []}
      resolved={resolved}
      onValueChange={(value) => onAnswerChange({ type: question.type, value })}
    />
  );
}

function asList(value: CaseStudyPartAnswer | undefined): string[] {
  if (Array.isArray(value)) {
    return value;
  }
  if (typeof value === "string") {
    return [value];
  }
  return [];
}

function asMapping(value: unknown): Record<string, string> {
  return typeof value === "object" && !Array.isArray(value) && value !== null
    ? (value as Record<string, string>)
    : {};
}

function casePartControl(
  part: CaseStudyPart,
  value: CaseStudyPartAnswer | undefined,
  correct: CaseStudyPartAnswer | undefined,
  resolved: boolean,
  onChange: (next: CaseStudyPartAnswer) => void
): ReactNode {
  if (part.type === "fill-blank") {
    return (
      <QuestionFillBlankField
        value={typeof value === "string" ? value : ""}
        acceptedAnswers={asList(correct)}
        resolved={resolved}
        onValueChange={onChange}
      />
    );
  }

  if (part.type === "dropdown") {
    return (
      <QuestionDropdownFieldGroup
        legend={part.prompt}
        dropdowns={part.dropdowns}
        value={asMapping(value)}
        correctAnswer={asMapping(correct)}
        resolved={resolved}
        onValueChange={onChange}
      />
    );
  }

  return (
    <QuestionChoiceFieldSet
      legend={part.prompt}
      mode={part.type === "multiple-choice" ? "multiple" : "single"}
      options={part.options}
      value={asList(value)}
      correctIds={asList(correct)}
      resolved={resolved}
      onValueChange={(ids: string[]) =>
        onChange(part.type === "multiple-choice" ? ids : (ids[0] ?? ""))
      }
    />
  );
}

function caseStudyAnswer(
  question: QuestionPropertiesOf<"case-study">,
  { answer, resolved, onAnswerChange }: Context
): ReactNode {
  const value = answer?.type === "case-study" ? answer.value : {};

  return (
    <QuestionCaseStudyTabs
      title={question.title}
      context={question.context}
      sections={question.sections}
    >
      {question.parts.length === 0
        ? null
        : question.parts.map((part, index) => (
            <QuestionCaseStudyFieldSet
              key={part.id}
              item={part}
              position={index + 1}
              resolved={resolved}
            >
              {casePartControl(
                part,
                value[part.id],
                question.correctAnswer[part.id],
                resolved,
                (next) =>
                  onAnswerChange({
                    type: question.type,
                    value: { ...value, [part.id]: next },
                  })
              )}
            </QuestionCaseStudyFieldSet>
          ))}
    </QuestionCaseStudyTabs>
  );
}

function answerControl(
  question: QuestionProperties,
  context: Context
): ReactNode {
  switch (question.type) {
    case "single-choice":
    case "true-false":
      return choiceAnswer(question, context);
    case "multiple-choice":
      return multipleChoiceAnswer(question, context);
    case "fill-blank":
      return fillBlankAnswer(question, context);
    case "dropdown":
      return dropdownAnswer(question, context);
    case "matching":
      return matchingAnswer(question, context);
    case "ordering":
      return orderingAnswer(question, context);
    case "drag-and-drop":
      return dragAndDropAnswer(question, context);
    case "hotspot":
      return hotspotAnswer(question, context);
    case "matrix":
      return matrixAnswer(question, context);
    case "simulation":
      return simulationAnswer(question, context);
    case "case-study":
      return caseStudyAnswer(question, context);
  }
}

/** Picks the answering control that fits the question type. */
function QuestionAnswerFieldSet({
  question,
  answer,
  resolved,
  onAnswerChange,
  className,
  ...props
}: QuestionAnswerFieldSetProps) {
  return (
    <FieldSet
      data-slot="question-answer-set"
      data-type={question.type}
      {...props}
      className={cn("min-w-0 gap-4", className)}
    >
      {answerControl(question, { answer, resolved, onAnswerChange })}
    </FieldSet>
  );
}

export { QuestionAnswerFieldSet };
export type { QuestionAnswerFieldSetProps };
