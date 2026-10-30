"use client";

import { ChevronDownIcon, PaperclipIcon } from "lucide-react";
import type { ComponentProps } from "react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface QueueMessagePart {
  type: string;
  text?: string;
  url?: string;
  filename?: string;
  mediaType?: string;
}

interface QueueMessage {
  id: string;
  parts: QueueMessagePart[];
}

interface QueueTodo {
  id: string;
  title: string;
  description?: string;
  status?: "pending" | "completed";
}

type QueueItemProps = ComponentProps<"li">;

const QueueItem = ({ className, ...props }: QueueItemProps) => (
  <li
    className={cn(
      "group flex flex-col gap-1 rounded-md px-3 py-1 text-sm transition-colors hover:bg-muted",
      className,
    )}
    {...props}
  />
);

type QueueItemIndicatorProps = ComponentProps<"span"> & {
  completed?: boolean;
};

const QueueItemIndicator = ({
  completed = false,
  className,
  ...props
}: QueueItemIndicatorProps) => (
  <span
    className={cn(
      "mt-0.5 inline-block size-2.5 rounded-full border",
      completed
        ? "border-muted-foreground/20 bg-muted-foreground/10"
        : "border-muted-foreground/50",
      className,
    )}
    {...props}
  />
);

type QueueItemContentProps = ComponentProps<"span"> & {
  completed?: boolean;
};

const QueueItemContent = ({
  completed = false,
  className,
  ...props
}: QueueItemContentProps) => (
  <span
    className={cn(
      "line-clamp-1 grow break-words",
      completed
        ? "text-muted-foreground/50 line-through"
        : "text-muted-foreground",
      className,
    )}
    {...props}
  />
);

type QueueItemDescriptionProps = ComponentProps<"div"> & {
  completed?: boolean;
};

const QueueItemDescription = ({
  completed = false,
  className,
  ...props
}: QueueItemDescriptionProps) => (
  <div
    className={cn(
      "ml-6 text-xs",
      completed
        ? "text-muted-foreground/40 line-through"
        : "text-muted-foreground",
      className,
    )}
    {...props}
  />
);

type QueueItemActionsProps = ComponentProps<"div">;

const QueueItemActions = ({ className, ...props }: QueueItemActionsProps) => (
  <div className={cn("flex gap-1", className)} {...props} />
);

type QueueItemActionProps = Omit<
  ComponentProps<typeof Button>,
  "variant" | "size"
>;

const QueueItemAction = ({ className, ...props }: QueueItemActionProps) => (
  <Button
    className={cn(
      "size-auto rounded p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-muted-foreground/10 hover:text-foreground group-hover:opacity-100 group-focus-within:opacity-100 focus-visible:opacity-100",
      className,
    )}
    size="icon"
    type="button"
    variant="ghost"
    {...props}
  />
);

type QueueItemAttachmentProps = ComponentProps<"div">;

const QueueItemAttachment = ({
  className,
  ...props
}: QueueItemAttachmentProps) => (
  <div className={cn("mt-1 flex flex-wrap gap-2", className)} {...props} />
);

type QueueItemImageProps = ComponentProps<"img">;

const QueueItemImage = ({ className, ...props }: QueueItemImageProps) => (
  <img
    alt=""
    className={cn("h-8 w-8 rounded border object-cover", className)}
    height={32}
    width={32}
    {...props}
  />
);

type QueueItemFileProps = ComponentProps<"span">;

const QueueItemFile = ({
  children,
  className,
  ...props
}: QueueItemFileProps) => (
  <span
    className={cn(
      "flex items-center gap-1 rounded border bg-muted px-2 py-1 text-xs",
      className,
    )}
    {...props}
  >
    <PaperclipIcon size={12} />
    <span className="max-w-[100px] truncate">{children}</span>
  </span>
);

type QueueListProps = ComponentProps<typeof ScrollArea>;

const QueueList = ({ children, className, ...props }: QueueListProps) => (
  <ScrollArea className={cn("mt-2 -mb-1", className)} {...props}>
    <div className="max-h-40 pr-4">
      <ul>{children}</ul>
    </div>
  </ScrollArea>
);

// QueueSection - collapsible section container
type QueueSectionProps = ComponentProps<typeof Collapsible>;

const QueueSection = ({
  className,
  defaultOpen = true,
  ...props
}: QueueSectionProps) => (
  <Collapsible className={cn(className)} defaultOpen={defaultOpen} {...props} />
);

// QueueSectionTrigger - section header/trigger
type QueueSectionTriggerProps = ComponentProps<"button">;

const QueueSectionTrigger = ({
  children,
  className,
  ...props
}: QueueSectionTriggerProps) => (
  <CollapsibleTrigger
    render={
      <button
        className={cn(
          "group flex w-full items-center justify-between rounded-md bg-muted/40 px-3 py-2 text-left font-medium text-muted-foreground text-sm transition-colors hover:bg-muted",
          className,
        )}
        type="button"
        {...props}
      />
    }
  >
    {children}
  </CollapsibleTrigger>
);

// QueueSectionLabel - label content with icon and count
type QueueSectionLabelProps = ComponentProps<"span"> & {
  count?: number;
  label: string;
  icon?: React.ReactNode;
};

const QueueSectionLabel = ({
  count,
  label,
  icon,
  className,
  ...props
}: QueueSectionLabelProps) => (
  <span className={cn("flex items-center gap-2", className)} {...props}>
    <ChevronDownIcon className="size-4 -rotate-90 transition-transform group-data-panel-open:rotate-0" />
    {icon}
    <span>
      {count} {label}
    </span>
  </span>
);

// QueueSectionContent - collapsible content area
type QueueSectionContentProps = ComponentProps<typeof CollapsibleContent>;

const QueueSectionContent = ({
  className,
  ...props
}: QueueSectionContentProps) => (
  <CollapsibleContent className={cn(className)} {...props} />
);

type QueueProps = ComponentProps<"div">;

const Queue = ({ className, ...props }: QueueProps) => (
  <div
    className={cn(
      "flex flex-col gap-2 rounded-xl border border-border bg-background px-3 pt-2 pb-2 shadow-xs",
      className,
    )}
    {...props}
  />
);

export {
  QueueItem,
  QueueItemIndicator,
  QueueItemContent,
  QueueItemDescription,
  QueueItemActions,
  QueueItemAction,
  QueueItemAttachment,
  QueueItemImage,
  QueueItemFile,
  QueueList,
  QueueSection,
  QueueSectionTrigger,
  QueueSectionLabel,
  QueueSectionContent,
  Queue,
  type QueueMessagePart,
  type QueueMessage,
  type QueueTodo,
  type QueueItemProps,
  type QueueItemIndicatorProps,
  type QueueItemContentProps,
  type QueueItemDescriptionProps,
  type QueueItemActionsProps,
  type QueueItemActionProps,
  type QueueItemAttachmentProps,
  type QueueItemImageProps,
  type QueueItemFileProps,
  type QueueListProps,
  type QueueSectionProps,
  type QueueSectionTriggerProps,
  type QueueSectionLabelProps,
  type QueueSectionContentProps,
  type QueueProps,
};
