"use client";

import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import type { Dispatch, SetStateAction } from "react";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import {
  isLegacyQuestion,
  migrateLegacyQuestion,
} from "@/lib/exam/migrate-legacy-question";
import { db } from "@/lib/firebase/firestore";
import { validateQuestionProperties } from "@/lib/validators/question";
import type { Card } from "@/types/card";
import type { QuestionObject } from "@/types/object";

export const SCROLL_TO_TOP_THRESHOLD = 400;

/**
 * Questions stored in the legacy ExamTopics shape are converted on read until
 * `scripts/tooling/migrate-questions.mjs` has rewritten them; one that cannot
 * be converted is skipped rather than rendered wrongly.
 */
function toQuestionObject(
  id: string,
  data: Record<string, unknown>
): QuestionObject | null {
  const question = { ...data, id } as unknown as QuestionObject;
  if (!question.properties) {
    return question;
  }
  if (isLegacyQuestion(question.properties)) {
    const migrated = migrateLegacyQuestion(question.properties);
    return migrated.ok
      ? { ...question, properties: migrated.properties }
      : null;
  }

  const validation = validateQuestionProperties(question.properties);
  return validation.success && validation.data
    ? { ...question, properties: validation.data }
    : null;
}

export type UseExamListOptions = {
  spaceId: string;
  examId: string;
};

export type UseExamListResult = {
  questions: QuestionObject[];
  cardsByQuestionId: ReadonlyMap<string, Card>;
  loading: boolean;
  error: Error | null;
  showScrollToTop: boolean;
  scrollToTop: () => void;
};

type ExamSubscriptionOptions = {
  uid: string | undefined;
  spaceId: string;
  examId: string;
  setQuestions: Dispatch<SetStateAction<QuestionObject[]>>;
  setCardsByQuestionId: Dispatch<SetStateAction<ReadonlyMap<string, Card>>>;
  setLoading: Dispatch<SetStateAction<boolean>>;
  setError: Dispatch<SetStateAction<Error | null>>;
};

function useExamSubscriptions({
  uid,
  spaceId,
  examId,
  setQuestions,
  setCardsByQuestionId,
  setLoading,
  setError,
}: ExamSubscriptionOptions) {
  useEffect(() => {
    if (!uid) {
      setQuestions([]);
      setCardsByQuestionId(new Map());
      setLoading(false);
      return;
    }
    setLoading(true);
    const spaceRoot = ["users", uid, "spaces", spaceId] as const;
    const questionsQuery = query(
      collection(db, ...spaceRoot, "objects"),
      where("objectTypeId", "==", "question"),
      where("properties.examId", "==", examId),
      orderBy("properties.orderIndex", "asc")
    );
    const unsubscribeQuestions = onSnapshot(
      questionsQuery,
      (snapshot) => {
        setQuestions(
          snapshot.docs.flatMap((docSnap) => {
            const question = toQuestionObject(docSnap.id, docSnap.data());
            return question ? [question] : [];
          })
        );
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );
    const unsubscribeCards = onSnapshot(
      collection(db, ...spaceRoot, "cards"),
      (snapshot) => {
        const next = new Map<string, Card>();
        for (const docSnap of snapshot.docs) {
          const card = { ...docSnap.data(), id: docSnap.id } as Card;
          next.set(card.questionId, card);
        }
        setCardsByQuestionId(next);
      },
      (err) => setError(err)
    );
    return () => {
      unsubscribeQuestions();
      unsubscribeCards();
    };
  }, [
    uid,
    spaceId,
    examId,
    setCardsByQuestionId,
    setError,
    setLoading,
    setQuestions,
  ]);
}

function useScrollToTop() {
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  useEffect(() => {
    const handleScroll = () =>
      setShowScrollToTop(window.scrollY > SCROLL_TO_TOP_THRESHOLD);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  return showScrollToTop;
}

export function useExamList({
  spaceId,
  examId,
}: UseExamListOptions): UseExamListResult {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<QuestionObject[]>([]);
  const [cardsByQuestionId, setCardsByQuestionId] = useState<
    ReadonlyMap<string, Card>
  >(new Map());
  const [loading, setLoading] = useState(Boolean(user));
  const [error, setError] = useState<Error | null>(null);
  const uid = user?.uid;

  useExamSubscriptions({
    uid,
    spaceId,
    examId,
    setQuestions,
    setCardsByQuestionId,
    setLoading,
    setError,
  });
  const showScrollToTop = useScrollToTop();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return {
    questions,
    cardsByQuestionId,
    loading,
    error,
    showScrollToTop,
    scrollToTop,
  };
}
