"use client";

import { useRef, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { createEmptyAnswer, isAnswerComplete } from "@/lib/exam/answer-draft";
import { evaluateAnswer } from "@/lib/exam/evaluate-answer";
import { submitAttempt } from "@/lib/firebase/attempts";
import type { Card } from "@/types/card";
import type { QuestionObject } from "@/types/object";
import type { SubmittedAnswer } from "@/types/question";

export type QuestionCardStatus =
  | "unanswered"
  | "answeredCorrect"
  | "answeredIncorrect"
  | "revealed";

export type UseQuestionCardOptions = {
  spaceId: string;
  question: QuestionObject;
  /** Companion Card; when absent the answer is graded locally and not logged. */
  card: Card | null;
};

export type UseQuestionCardResult = {
  status: QuestionCardStatus;
  /** The draft while answering and the submitted answer once graded. */
  answer: SubmittedAnswer | null;
  isSubmitting: boolean;
  hasSaveError: boolean;
  /** True once the correct answer is shown (answered or revealed). */
  isResolved: boolean;
  /** False for a case study without parts: there is nothing to answer or grade. */
  isGradable: boolean;
  /** Structured types are sent with a confirm action, except multiple-choice. */
  needsConfirmation: boolean;
  canSubmit: boolean;
  /** The general explanation is only surfaced after resolution and when present. */
  showExplanation: boolean;
  setAnswer: (answer: SubmittedAnswer) => void;
  submit: () => void;
  showAnswer: () => void;
  /** Starts a fresh attempt; earlier attempts stay in the immutable log. */
  retry: () => void;
};

type QuestionProperties = QuestionObject["properties"];

/** Types that are graded as soon as the answer is ready, without a confirm action. */
const AUTO_CHECKED_TYPES: ReadonlySet<QuestionProperties["type"]> = new Set([
  "single-choice",
  "true-false",
  "multiple-choice",
  "matching",
  "drag-and-drop",
  "hotspot",
  "dropdown",
  "case-study",
  "matrix",
]);

function getAnswerFlags(properties: QuestionProperties) {
  const isGradable =
    properties.type !== "case-study" || properties.parts.length > 0;
  const needsConfirmation =
    isGradable && !AUTO_CHECKED_TYPES.has(properties.type);
  return { isGradable, needsConfirmation };
}

/** Types graded as soon as every part of the draft is filled in. */
const GRADED_WHEN_COMPLETE: ReadonlySet<QuestionProperties["type"]> = new Set([
  "matching",
  "drag-and-drop",
  "dropdown",
  "case-study",
  "matrix",
]);

/** Whether a new draft is ready to be graded without a confirm action. */
function shouldAutoSubmit(
  properties: QuestionProperties,
  next: SubmittedAnswer
): boolean {
  if (properties.type === "single-choice" || properties.type === "true-false") {
    return true;
  }
  if (properties.type === "multiple-choice" || properties.type === "hotspot") {
    return (
      next.type === properties.type &&
      next.value.length >= properties.correctAnswer.length
    );
  }
  return (
    GRADED_WHEN_COMPLETE.has(properties.type) &&
    isAnswerComplete(properties, next)
  );
}

/** Tracks the status of one attempt and persists it once graded. */
function useQuestionAttempt({
  spaceId,
  question,
  card,
}: UseQuestionCardOptions) {
  const { user } = useAuth();
  const { properties } = question;
  const [status, setStatus] = useState<QuestionCardStatus>("unanswered");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSaveError, setHasSaveError] = useState(false);
  const startedAt = useRef(Date.now());

  const submitAnswer = async (submission: SubmittedAnswer) => {
    const evaluation = evaluateAnswer(properties, submission);
    setStatus(evaluation.correct ? "answeredCorrect" : "answeredIncorrect");
    setHasSaveError(false);

    if (!user || !card) {
      return;
    }

    setIsSubmitting(true);
    try {
      await submitAttempt({
        userId: user.uid,
        spaceId,
        card,
        input: {
          questionId: question.id,
          cardId: card.id,
          rating: evaluation.rating,
          reviewMode: "review",
          elapsedMilliseconds: Math.max(0, Date.now() - startedAt.current),
          questionType: properties.type,
          submittedAnswer: submission,
          isCorrect: evaluation.correct,
        },
      });
    } catch {
      // The attempt was not persisted: keep the answer so the learner can resend it.
      setStatus("unanswered");
      setHasSaveError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const reveal = () => setStatus("revealed");

  const restart = () => {
    setStatus("unanswered");
    setHasSaveError(false);
    startedAt.current = Date.now();
  };

  return {
    status,
    isSubmitting,
    hasSaveError,
    submitAnswer,
    reveal,
    restart,
  };
}

export function useQuestionCard({
  spaceId,
  question,
  card,
}: UseQuestionCardOptions): UseQuestionCardResult {
  const { properties } = question;
  const attempt = useQuestionAttempt({ spaceId, question, card });
  const { status, isSubmitting } = attempt;
  const [answer, setAnswerState] = useState<SubmittedAnswer | null>(() =>
    createEmptyAnswer(properties)
  );

  const isResolved = status !== "unanswered";
  const { isGradable, needsConfirmation } = getAnswerFlags(properties);
  const canSubmit =
    !isResolved && !isSubmitting && isAnswerComplete(properties, answer);

  const setAnswer = (next: SubmittedAnswer) => {
    if (!isGradable || isResolved || isSubmitting) {
      return;
    }
    setAnswerState(next);
    if (shouldAutoSubmit(properties, next)) {
      void attempt.submitAnswer(next);
    }
  };

  const submit = () => {
    if (canSubmit && answer !== null) {
      void attempt.submitAnswer(answer);
    }
  };

  /** Secondary action: reveal the key without logging an active recall score. */
  const showAnswer = () => {
    if (!isResolved) {
      attempt.reveal();
    }
  };

  const retry = () => {
    if (isResolved && !isSubmitting) {
      attempt.restart();
      setAnswerState(createEmptyAnswer(properties));
    }
  };

  return {
    status,
    answer,
    isSubmitting,
    hasSaveError: attempt.hasSaveError,
    isResolved,
    isGradable,
    needsConfirmation,
    canSubmit,
    showExplanation: isResolved && Boolean(properties.explanation),
    setAnswer,
    submit,
    showAnswer,
    retry,
  };
}
