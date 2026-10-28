"use client";

import { ChevronsUpDownIcon } from "lucide-react";
import type { ComponentProps } from "react";
import { createContext, useContext, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

import { Shimmer } from "./shimmer";

interface PlanContextValue {
  isStreaming: boolean;
}

const PlanContext = createContext<PlanContextValue | null>(null);

const usePlan = () => {
  const context = useContext(PlanContext);
  if (!context) {
    throw new Error("Plan components must be used within Plan");
  }
  return context;
};

type PlanProps = ComponentProps<typeof Collapsible> & {
  isStreaming?: boolean;
};

const Plan = ({
  className,
  isStreaming = false,
  children,
  ...props
}: PlanProps) => {
  const contextValue = useMemo(() => ({ isStreaming }), [isStreaming]);

  return (
    <PlanContext.Provider value={contextValue}>
      <Collapsible
        data-slot="plan"
        {...props}
        render={<Card className={cn("shadow-none", className)} />}
      >
        {children}
      </Collapsible>
    </PlanContext.Provider>
  );
};

type PlanHeaderProps = ComponentProps<typeof CardHeader>;

const PlanHeader = ({ className, ...props }: PlanHeaderProps) => (
  <CardHeader
    className={cn("flex items-start justify-between", className)}
    data-slot="plan-header"
    {...props}
  />
);

type PlanTitleProps = Omit<ComponentProps<typeof CardTitle>, "children"> & {
  children: string;
};

const PlanTitle = ({ children, ...props }: PlanTitleProps) => {
  const { isStreaming } = usePlan();

  return (
    <CardTitle data-slot="plan-title" {...props}>
      {isStreaming ? <Shimmer>{children}</Shimmer> : children}
    </CardTitle>
  );
};

type PlanDescriptionProps = Omit<
  ComponentProps<typeof CardDescription>,
  "children"
> & {
  children: string;
};

const PlanDescription = ({
  className,
  children,
  ...props
}: PlanDescriptionProps) => {
  const { isStreaming } = usePlan();

  return (
    <CardDescription
      className={cn("text-balance", className)}
      data-slot="plan-description"
      {...props}
    >
      {isStreaming ? <Shimmer>{children}</Shimmer> : children}
    </CardDescription>
  );
};

type PlanActionProps = ComponentProps<typeof CardAction>;

const PlanAction = (props: PlanActionProps) => (
  <CardAction data-slot="plan-action" {...props} />
);

type PlanContentProps = ComponentProps<typeof CardContent>;

const PlanContent = (props: PlanContentProps) => (
  <CollapsibleContent
    render={<CardContent data-slot="plan-content" {...props} />}
  ></CollapsibleContent>
);

type PlanFooterProps = ComponentProps<"div">;

const PlanFooter = (props: PlanFooterProps) => (
  <CardFooter data-slot="plan-footer" {...props} />
);

type PlanTriggerProps = Omit<
  ComponentProps<typeof CollapsibleTrigger>,
  "render"
>;

const PlanTrigger = ({ className, ...props }: PlanTriggerProps) => (
  <CollapsibleTrigger
    {...props}
    render={
      <Button
        className={cn("size-8", className)}
        data-slot="plan-trigger"
        size="icon"
        variant="ghost"
      />
    }
  >
    <ChevronsUpDownIcon className="size-4" />
    <span className="sr-only">Toggle plan</span>
  </CollapsibleTrigger>
);

export {
  Plan,
  PlanHeader,
  PlanTitle,
  PlanDescription,
  PlanAction,
  PlanContent,
  PlanFooter,
  PlanTrigger,
  type PlanProps,
  type PlanHeaderProps,
  type PlanTitleProps,
  type PlanDescriptionProps,
  type PlanActionProps,
  type PlanContentProps,
  type PlanFooterProps,
  type PlanTriggerProps,
};
