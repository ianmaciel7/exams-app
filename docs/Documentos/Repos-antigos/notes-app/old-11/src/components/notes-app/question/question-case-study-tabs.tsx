"use client";

import { useTranslations } from "next-intl";
import type { ComponentProps } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { CaseStudySection } from "@/types/question";

type QuestionCaseStudyTabsProps = ComponentProps<"section"> & {
  title: string;
  context: string;
  sections: CaseStudySection[];
};

/**
 * Case-study material in tabs. The children are the questions about it and
 * are rendered below the material.
 */
function QuestionCaseStudyTabs({
  title,
  context,
  sections,
  children,
  className,
  ...props
}: QuestionCaseStudyTabsProps) {
  const t = useTranslations("exam");

  return (
    <section
      data-slot="question-case-study-tabs"
      aria-label={title}
      {...props}
      className={cn("flex min-w-0 flex-col gap-4", className)}
    >
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      <p className="whitespace-pre-wrap text-sm text-foreground">{context}</p>
      <Tabs defaultValue={sections[0]?.id}>
        <TabsList
          aria-label={t("caseStudySections")}
          className="h-auto flex-wrap"
        >
          {sections.map((section) => (
            <TabsTrigger key={section.id} value={section.id}>
              {section.title}
            </TabsTrigger>
          ))}
        </TabsList>
        {sections.map((section) => (
          <TabsContent key={section.id} value={section.id}>
            <p className="whitespace-pre-wrap rounded-lg border border-border bg-muted/30 p-3 text-foreground">
              {section.content}
            </p>
          </TabsContent>
        ))}
      </Tabs>
      {children ? (
        <div className="flex flex-col gap-3">
          <h4 className="text-sm font-semibold text-foreground">
            {t("caseStudyQuestions")}
          </h4>
          {children}
        </div>
      ) : null}
    </section>
  );
}

export { QuestionCaseStudyTabs, type QuestionCaseStudyTabsProps };
