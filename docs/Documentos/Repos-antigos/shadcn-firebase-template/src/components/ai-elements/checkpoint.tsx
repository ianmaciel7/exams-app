"use client";

import type { LucideProps } from "lucide-react";
import { BookmarkIcon } from "lucide-react";
import type { ComponentProps, HTMLAttributes } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type CheckpointProps = HTMLAttributes<HTMLDivElement>;

const Checkpoint = ({ className, children, ...props }: CheckpointProps) => (
  <div
    className={cn(
      "flex items-center gap-0.5 overflow-hidden text-muted-foreground",
      className,
    )}
    {...props}
  >
    {children}
    <Separator />
  </div>
);

type CheckpointIconProps = LucideProps;

const CheckpointIcon = ({
  className,
  children,
  ...props
}: CheckpointIconProps) =>
  children ?? (
    <BookmarkIcon className={cn("size-4 shrink-0", className)} {...props} />
  );

type CheckpointTriggerProps = ComponentProps<typeof Button> & {
  tooltip?: string;
};

const CheckpointTrigger = ({
  children,
  variant = "ghost",
  size = "sm",
  tooltip,
  ...props
}: CheckpointTriggerProps) =>
  tooltip ? (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button size={size} type="button" variant={variant} {...props} />
        }
      >
        {children}
      </TooltipTrigger>
      <TooltipContent align="start" side="bottom">
        {tooltip}
      </TooltipContent>
    </Tooltip>
  ) : (
    <Button size={size} type="button" variant={variant} {...props}>
      {children}
    </Button>
  );

export {
  Checkpoint,
  CheckpointIcon,
  CheckpointTrigger,
  type CheckpointProps,
  type CheckpointIconProps,
  type CheckpointTriggerProps,
};
