"use client";

import type { LanguageModelUsage } from "ai";
import type { ComponentProps } from "react";
import { createContext, useContext, useMemo } from "react";
import { getUsage } from "tokenlens";
import { Button } from "@/components/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const PERCENT_MAX = 100;
const ICON_RADIUS = 10;
const ICON_VIEWBOX = 24;
const ICON_CENTER = 12;
const ICON_STROKE_WIDTH = 2;

type ModelId = string;

interface ContextSchema {
  usedTokens: number;
  maxTokens: number;
  usage?: LanguageModelUsage;
  modelId?: ModelId;
}

interface ContextValue extends ContextSchema {
  tokens: {
    input: number;
    output: number;
    cacheReads: number;
    cacheWrites: number;
    reasoning: number;
  };
  costs: ReturnType<typeof getUsage>["costUSD"];
}

const ContextContext = createContext<ContextValue | null>(null);

const useContextValue = () => {
  const context = useContext(ContextContext);

  if (!context) {
    throw new Error("Context components must be used within Context");
  }

  return context;
};

type ContextProps = ComponentProps<typeof HoverCard> & ContextSchema;

const Context = ({
  usedTokens,
  maxTokens,
  usage,
  modelId,
  ...props
}: ContextProps) => {
  const contextValue = useMemo(() => {
    const cacheReads = usage?.inputTokenDetails.cacheReadTokens ?? 0;
    const cacheWrites = usage?.inputTokenDetails.cacheWriteTokens ?? 0;
    const tokens = {
      input:
        usage?.inputTokenDetails.noCacheTokens ??
        Math.max(0, (usage?.inputTokens ?? 0) - cacheReads - cacheWrites),
      output: usage?.outputTokens ?? 0,
      cacheReads,
      cacheWrites,
      reasoning: usage?.outputTokenDetails.reasoningTokens ?? 0,
    };
    // AI SDK output includes reasoning. Do not charge it a second time.
    const costs = modelId
      ? getUsage({
          modelId,
          usage: {
            input: tokens.input,
            output: tokens.output,
            cacheReads,
            cacheWrites,
          },
        }).costUSD
      : undefined;
    return { maxTokens, modelId, usage, usedTokens, tokens, costs };
  }, [maxTokens, modelId, usage, usedTokens]);

  return (
    <ContextContext.Provider value={contextValue}>
      <HoverCard {...props} />
    </ContextContext.Provider>
  );
};

const ContextIcon = () => {
  const { usedTokens, maxTokens } = useContextValue();
  const circumference = 2 * Math.PI * ICON_RADIUS;
  const usedPercent = usedTokens / maxTokens;
  const dashOffset = circumference * (1 - usedPercent);

  return (
    <svg
      aria-label="Model context usage"
      height="20"
      role="img"
      style={{ color: "currentcolor" }}
      viewBox={`0 0 ${ICON_VIEWBOX} ${ICON_VIEWBOX}`}
      width="20"
    >
      <circle
        cx={ICON_CENTER}
        cy={ICON_CENTER}
        fill="none"
        opacity="0.25"
        r={ICON_RADIUS}
        stroke="currentColor"
        strokeWidth={ICON_STROKE_WIDTH}
      />
      <circle
        cx={ICON_CENTER}
        cy={ICON_CENTER}
        fill="none"
        opacity="0.7"
        r={ICON_RADIUS}
        stroke="currentColor"
        strokeDasharray={`${circumference} ${circumference}`}
        strokeDashoffset={dashOffset}
        strokeLinecap="round"
        strokeWidth={ICON_STROKE_WIDTH}
        style={{ transform: "rotate(-90deg)", transformOrigin: "center" }}
      />
    </svg>
  );
};

type ContextTriggerProps = ComponentProps<typeof Button>;

const ContextTrigger = ({ children, ...props }: ContextTriggerProps) => {
  const { usedTokens, maxTokens } = useContextValue();
  const usedPercent = usedTokens / maxTokens;
  const renderedPercent = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 1,
    style: "percent",
  }).format(usedPercent);

  return (
    <HoverCardTrigger>
      {children ?? (
        <Button type="button" variant="ghost" {...props}>
          <span className="font-medium text-muted-foreground">
            {renderedPercent}
          </span>
          <ContextIcon />
        </Button>
      )}
    </HoverCardTrigger>
  );
};

type ContextContentProps = ComponentProps<typeof HoverCardContent>;

const ContextContent = ({ className, ...props }: ContextContentProps) => (
  <HoverCardContent
    className={cn("min-w-60 divide-y overflow-hidden p-0", className)}
    {...props}
  />
);

type ContextContentHeaderProps = ComponentProps<"div"> & {
  progressLabel?: string;
};

const ContextContentHeader = ({
  children,
  className,
  progressLabel = "Model context usage",
  ...props
}: ContextContentHeaderProps) => {
  const { usedTokens, maxTokens } = useContextValue();
  const usedPercent = usedTokens / maxTokens;
  const displayPct = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 1,
    style: "percent",
  }).format(usedPercent);
  const used = new Intl.NumberFormat("en-US", {
    notation: "compact",
  }).format(usedTokens);
  const total = new Intl.NumberFormat("en-US", {
    notation: "compact",
  }).format(maxTokens);

  return (
    <div className={cn("w-full space-y-2 p-3", className)} {...props}>
      {children ?? (
        <>
          <div className="flex items-center justify-between gap-3 text-xs">
            <p>{displayPct}</p>
            <p className="font-mono text-muted-foreground">
              {used} / {total}
            </p>
          </div>
          <div className="space-y-2">
            <Progress
              aria-label={progressLabel}
              className="bg-muted"
              value={usedPercent * PERCENT_MAX}
            />
          </div>
        </>
      )}
    </div>
  );
};

type ContextContentBodyProps = ComponentProps<"div">;

const ContextContentBody = ({
  children,
  className,
  ...props
}: ContextContentBodyProps) => (
  <div className={cn("w-full p-3", className)} {...props}>
    {children}
  </div>
);

type ContextContentFooterProps = ComponentProps<"div">;

const ContextContentFooter = ({
  children,
  className,
  ...props
}: ContextContentFooterProps) => {
  const { costs } = useContextValue();
  const costUSD = costs?.totalUSD;
  const totalCost = new Intl.NumberFormat("en-US", {
    currency: "USD",
    style: "currency",
  }).format(costUSD ?? 0);

  return (
    <div
      className={cn(
        "flex w-full items-center justify-between gap-3 bg-secondary p-3 text-xs",
        className,
      )}
      {...props}
    >
      {children ?? (
        <>
          <span className="text-muted-foreground">Total cost</span>
          <span>{totalCost}</span>
        </>
      )}
    </div>
  );
};

const TokensWithCost = ({
  tokens,
  costText,
}: {
  tokens?: number;
  costText?: string;
}) => (
  <span>
    {tokens === undefined
      ? "—"
      : new Intl.NumberFormat("en-US", {
          notation: "compact",
        }).format(tokens)}
    {costText ? (
      <span className="ml-2 text-muted-foreground">• {costText}</span>
    ) : null}
  </span>
);

type ContextInputUsageProps = ComponentProps<"div">;

const ContextInputUsage = ({
  className,
  children,
  ...props
}: ContextInputUsageProps) => {
  const { tokens, costs } = useContextValue();
  const inputTokens = tokens.input;

  if (children) {
    return children;
  }

  if (!inputTokens) {
    return null;
  }

  const inputCost = costs?.inputUSD;
  const inputCostText = new Intl.NumberFormat("en-US", {
    currency: "USD",
    style: "currency",
  }).format(inputCost ?? 0);

  return (
    <div
      className={cn("flex items-center justify-between text-xs", className)}
      {...props}
    >
      <span className="text-muted-foreground">Input (uncached)</span>
      <TokensWithCost costText={inputCostText} tokens={inputTokens} />
    </div>
  );
};

type ContextOutputUsageProps = ComponentProps<"div">;

const ContextOutputUsage = ({
  className,
  children,
  ...props
}: ContextOutputUsageProps) => {
  const { tokens, costs } = useContextValue();
  const outputTokens = tokens.output;

  if (children) {
    return children;
  }

  if (!outputTokens) {
    return null;
  }

  const outputCost = costs?.outputUSD;
  const outputCostText = new Intl.NumberFormat("en-US", {
    currency: "USD",
    style: "currency",
  }).format(outputCost ?? 0);

  return (
    <div
      className={cn("flex items-center justify-between text-xs", className)}
      {...props}
    >
      <span className="text-muted-foreground">Output</span>
      <TokensWithCost costText={outputCostText} tokens={outputTokens} />
    </div>
  );
};

type ContextReasoningUsageProps = ComponentProps<"div">;

const ContextReasoningUsage = ({
  className,
  children,
  ...props
}: ContextReasoningUsageProps) => {
  const { tokens, costs } = useContextValue();
  const reasoningTokens = tokens.reasoning;

  if (children) {
    return children;
  }

  if (!reasoningTokens) {
    return null;
  }

  // Informational subset of Output, rather than an additional charge.
  const reasoningCost =
    costs?.outputUSD === undefined || !tokens.output
      ? undefined
      : (costs.outputUSD * reasoningTokens) / tokens.output;
  const reasoningCostText = new Intl.NumberFormat("en-US", {
    currency: "USD",
    style: "currency",
  }).format(reasoningCost ?? 0);

  return (
    <div
      className={cn("flex items-center justify-between text-xs", className)}
      {...props}
    >
      <span className="text-muted-foreground">
        Reasoning (included in output)
      </span>
      <TokensWithCost costText={reasoningCostText} tokens={reasoningTokens} />
    </div>
  );
};

type ContextCacheUsageProps = ComponentProps<"div">;

const ContextCacheUsage = ({
  className,
  children,
  ...props
}: ContextCacheUsageProps) => {
  const { tokens, costs } = useContextValue();
  const cacheTokens = tokens.cacheReads + tokens.cacheWrites;

  if (children) {
    return children;
  }

  if (!cacheTokens) {
    return null;
  }

  const cacheCost = costs
    ? (costs.cacheReadUSD ?? 0) + (costs.cacheWriteUSD ?? 0)
    : undefined;
  const cacheCostText = new Intl.NumberFormat("en-US", {
    currency: "USD",
    style: "currency",
  }).format(cacheCost ?? 0);

  return (
    <div
      className={cn("flex items-center justify-between text-xs", className)}
      {...props}
    >
      <span className="text-muted-foreground">Cache</span>
      <TokensWithCost costText={cacheCostText} tokens={cacheTokens} />
    </div>
  );
};

export {
  Context,
  ContextTrigger,
  ContextContent,
  ContextContentHeader,
  ContextContentBody,
  ContextContentFooter,
  ContextInputUsage,
  ContextOutputUsage,
  ContextReasoningUsage,
  ContextCacheUsage,
  type ContextProps,
  type ContextTriggerProps,
  type ContextContentProps,
  type ContextContentHeaderProps,
  type ContextContentBodyProps,
  type ContextContentFooterProps,
  type ContextInputUsageProps,
  type ContextOutputUsageProps,
  type ContextReasoningUsageProps,
  type ContextCacheUsageProps,
};
