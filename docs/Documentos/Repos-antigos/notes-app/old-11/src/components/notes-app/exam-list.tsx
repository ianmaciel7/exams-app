"use client";

import { useTranslations } from "next-intl";
import type { ComponentProps } from "react";
import { QuestionCard } from "@/components/notes-app/question/question-card";
import { ScrollToTopButton } from "@/components/notes-app/scroll-to-top-button";
import { Empty, EmptyDescription } from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";
import { useExamList } from "@/hooks/use-exam-list";
import { cn } from "@/lib/utils";

type ExamListProps = Omit<ComponentProps<"section">, "children"> & {
  spaceId: string;
  examId: string;
};

function ExamList({ spaceId, examId, className, ...props }: ExamListProps) {
  const t = useTranslations("exam");
  const {
    questions,
    cardsByQuestionId,
    loading,
    error,
    showScrollToTop,
    scrollToTop,
  } = useExamList({ spaceId, examId });

  return (
    <section
      data-slot="exam-list"
      aria-label={t("feedLabel")}
      {...props}
      className={cn(
        "mx-auto flex w-full max-w-3xl flex-col gap-4 p-4",
        className
      )}
    >
      {loading ? (
        <Empty role="status">
          <Spinner />
          <EmptyDescription>{t("loading")}</EmptyDescription>
        </Empty>
      ) : null}
      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error.message}
        </p>
      ) : null}
      {!loading && !error && questions.length === 0 ? (
        <Empty>
          <EmptyDescription>{t("empty")}</EmptyDescription>
        </Empty>
      ) : null}
      {questions.map((question, index) => (
        <QuestionCard
          key={question.id}
          spaceId={spaceId}
          question={question}
          card={cardsByQuestionId.get(question.id) ?? null}
          index={index}
          total={questions.length}
        />
      ))}
      {showScrollToTop ? <ScrollToTopButton onClick={scrollToTop} /> : null}
    </section>
  );
}

export { ExamList, type ExamListProps };
