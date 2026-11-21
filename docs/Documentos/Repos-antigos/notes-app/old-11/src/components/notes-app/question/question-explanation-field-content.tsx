"use client";

import type { ComponentProps } from "react";
import { FieldContent } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import type { GroundedExplanation } from "@/types/question";

type QuestionExplanationFieldContentProps = Omit<
  ComponentProps<typeof FieldContent>,
  "children"
> & {
  explanation: GroundedExplanation;
};

function QuestionExplanationFieldContent({
  explanation,
  className,
  ...props
}: QuestionExplanationFieldContentProps) {
  return (
    <FieldContent
      data-slot="question-explanation-field-content"
      {...props}
      className={cn(
        "flex flex-col gap-2 text-left text-sm leading-normal font-normal text-muted-foreground",
        "[&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-primary",
        className
      )}
    >
      <div className="whitespace-pre-wrap text-sm text-foreground">
        {explanation.text}
      </div>
      {explanation.referenceUrls.length > 0 ? (
        <ul className="flex flex-col gap-1">
          {explanation.referenceUrls.map((url) => (
            <li key={url}>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex text-xs text-primary underline hover:no-underline"
              >
                {url}
              </a>
            </li>
          ))}
        </ul>
      ) : null}
    </FieldContent>
  );
}

export {
  QuestionExplanationFieldContent,
  type QuestionExplanationFieldContentProps,
};
