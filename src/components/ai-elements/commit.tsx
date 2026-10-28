"use client";

import {
  CheckIcon,
  CopyIcon,
  FileIcon,
  GitCommitIcon,
  MinusIcon,
  PlusIcon,
} from "lucide-react";
import type { ComponentProps, HTMLAttributes } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

type CommitProps = ComponentProps<typeof Collapsible>;

const Commit = ({ className, children, ...props }: CommitProps) => (
  <Collapsible
    className={cn("rounded-lg border bg-background", className)}
    {...props}
  >
    {children}
  </Collapsible>
);

type CommitHeaderProps = ComponentProps<typeof CollapsibleTrigger>;

const CommitHeader = ({ className, children, ...props }: CommitHeaderProps) => (
  <CollapsibleTrigger
    {...props}
    nativeButton={false}
    render={
      <div
        className={cn(
          "group flex cursor-pointer items-center justify-between gap-4 p-3 text-left transition-colors hover:opacity-80",
          className,
        )}
      />
    }
  >
    {children}
  </CollapsibleTrigger>
);

type CommitHashProps = HTMLAttributes<HTMLSpanElement>;

const CommitHash = ({ className, children, ...props }: CommitHashProps) => (
  <span className={cn("font-mono text-xs", className)} {...props}>
    <GitCommitIcon className="mr-1 inline-block size-3" />
    {children}
  </span>
);

type CommitMessageProps = HTMLAttributes<HTMLSpanElement>;

const CommitMessage = ({
  className,
  children,
  ...props
}: CommitMessageProps) => (
  <span className={cn("font-medium text-sm", className)} {...props}>
    {children}
  </span>
);

type CommitMetadataProps = HTMLAttributes<HTMLDivElement>;

const CommitMetadata = ({
  className,
  children,
  ...props
}: CommitMetadataProps) => (
  <div
    className={cn(
      "flex items-center gap-2 text-muted-foreground text-xs",
      className,
    )}
    {...props}
  >
    {children}
  </div>
);

type CommitSeparatorProps = HTMLAttributes<HTMLSpanElement>;

const CommitSeparator = ({
  className,
  children,
  ...props
}: CommitSeparatorProps) => (
  <span className={className} {...props}>
    {children ?? "•"}
  </span>
);

type CommitInfoProps = HTMLAttributes<HTMLDivElement>;

const CommitInfo = ({ className, children, ...props }: CommitInfoProps) => (
  <div className={cn("flex flex-1 flex-col", className)} {...props}>
    {children}
  </div>
);

type CommitAuthorProps = HTMLAttributes<HTMLDivElement>;

const CommitAuthor = ({ className, children, ...props }: CommitAuthorProps) => (
  <div className={cn("flex items-center", className)} {...props}>
    {children}
  </div>
);

type CommitAuthorAvatarProps = ComponentProps<typeof Avatar> & {
  initials: string;
};

const CommitAuthorAvatar = ({
  initials,
  className,
  ...props
}: CommitAuthorAvatarProps) => (
  <Avatar className={cn("size-8", className)} {...props}>
    <AvatarFallback className="text-xs">{initials}</AvatarFallback>
  </Avatar>
);

type CommitTimestampProps = HTMLAttributes<HTMLTimeElement> & {
  date: Date;
};

const relativeTimeFormat = new Intl.RelativeTimeFormat("en", {
  numeric: "auto",
});

const formatRelativeDate = (date: Date) => {
  const days = Math.round(
    (date.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
  );
  return relativeTimeFormat.format(days, "day");
};

const CommitTimestamp = ({
  date,
  className,
  children,
  ...props
}: CommitTimestampProps) => {
  const [formatted, setFormatted] = useState("");

  const updateFormatted = useCallback(() => {
    setFormatted(formatRelativeDate(date));
  }, [date]);

  useEffect(() => {
    updateFormatted();
  }, [updateFormatted]);

  return (
    <time
      className={cn("text-xs", className)}
      dateTime={date.toISOString()}
      {...props}
    >
      {children ?? formatted}
    </time>
  );
};

type CommitActionsProps = HTMLAttributes<HTMLDivElement>;

const handleActionsClick = (e: React.MouseEvent) => e.stopPropagation();
const handleActionsKeyDown = (e: React.KeyboardEvent) => e.stopPropagation();

const CommitActions = ({
  className,
  children,
  ...props
}: CommitActionsProps) => (
  <div
    className={cn("flex items-center gap-1", className)}
    onClick={handleActionsClick}
    onKeyDown={handleActionsKeyDown}
    role="group"
    {...props}
  >
    {children}
  </div>
);

type CommitCopyButtonProps = ComponentProps<typeof Button> & {
  hash: string;
  onCopy?: () => void;
  onError?: (error: Error) => void;
  timeout?: number;
};

const CommitCopyButton = ({
  hash,
  onCopy,
  onError,
  timeout = 2000,
  children,
  className,
  ...props
}: CommitCopyButtonProps) => {
  const [isCopied, setIsCopied] = useState(false);
  const timeoutRef = useRef<number>(0);

  const copyToClipboard = useCallback(async () => {
    if (typeof window === "undefined" || !navigator?.clipboard?.writeText) {
      onError?.(new Error("Clipboard API not available"));
      return;
    }

    try {
      if (!isCopied) {
        await navigator.clipboard.writeText(hash);
        setIsCopied(true);
        onCopy?.();
        timeoutRef.current = window.setTimeout(
          () => setIsCopied(false),
          timeout,
        );
      }
    } catch (error) {
      onError?.(error as Error);
    }
  }, [hash, onCopy, onError, timeout, isCopied]);

  useEffect(
    () => () => {
      window.clearTimeout(timeoutRef.current);
    },
    [],
  );

  const Icon = isCopied ? CheckIcon : CopyIcon;

  return (
    <Button
      className={cn("size-7 shrink-0", className)}
      onClick={copyToClipboard}
      size="icon"
      variant="ghost"
      {...props}
    >
      {children ?? <Icon size={14} />}
    </Button>
  );
};

type CommitContentProps = ComponentProps<typeof CollapsibleContent>;

const CommitContent = ({
  className,
  children,
  ...props
}: CommitContentProps) => (
  <CollapsibleContent className={cn("border-t p-3", className)} {...props}>
    {children}
  </CollapsibleContent>
);

type CommitFilesProps = HTMLAttributes<HTMLDivElement>;

const CommitFiles = ({ className, children, ...props }: CommitFilesProps) => (
  <div className={cn("space-y-1", className)} {...props}>
    {children}
  </div>
);

type CommitFileProps = HTMLAttributes<HTMLDivElement>;

const CommitFile = ({ className, children, ...props }: CommitFileProps) => (
  <div
    className={cn(
      "flex items-center justify-between gap-2 rounded px-2 py-1 text-sm hover:bg-muted/50",
      className,
    )}
    {...props}
  >
    {children}
  </div>
);

type CommitFileInfoProps = HTMLAttributes<HTMLDivElement>;

const CommitFileInfo = ({
  className,
  children,
  ...props
}: CommitFileInfoProps) => (
  <div className={cn("flex min-w-0 items-center gap-2", className)} {...props}>
    {children}
  </div>
);

const fileStatusStyles = {
  added: "text-green-600 dark:text-green-400",
  deleted: "text-red-600 dark:text-red-400",
  modified: "text-yellow-600 dark:text-yellow-400",
  renamed: "text-blue-600 dark:text-blue-400",
};

const fileStatusLabels = {
  added: "A",
  deleted: "D",
  modified: "M",
  renamed: "R",
};

type CommitFileStatusProps = HTMLAttributes<HTMLSpanElement> & {
  status: "added" | "modified" | "deleted" | "renamed";
};

const CommitFileStatus = ({
  status,
  className,
  children,
  ...props
}: CommitFileStatusProps) => (
  <span
    className={cn(
      "font-medium font-mono text-xs",
      fileStatusStyles[status],
      className,
    )}
    {...props}
  >
    {children ?? fileStatusLabels[status]}
  </span>
);

type CommitFileIconProps = ComponentProps<typeof FileIcon>;

const CommitFileIcon = ({ className, ...props }: CommitFileIconProps) => (
  <FileIcon
    className={cn("size-3.5 shrink-0 text-muted-foreground", className)}
    {...props}
  />
);

type CommitFilePathProps = HTMLAttributes<HTMLSpanElement>;

const CommitFilePath = ({
  className,
  children,
  ...props
}: CommitFilePathProps) => (
  <span className={cn("truncate font-mono text-xs", className)} {...props}>
    {children}
  </span>
);

type CommitFileChangesProps = HTMLAttributes<HTMLDivElement>;

const CommitFileChanges = ({
  className,
  children,
  ...props
}: CommitFileChangesProps) => (
  <div
    className={cn(
      "flex shrink-0 items-center gap-1 font-mono text-xs",
      className,
    )}
    {...props}
  >
    {children}
  </div>
);

type CommitFileAdditionsProps = HTMLAttributes<HTMLSpanElement> & {
  count: number;
};

const CommitFileAdditions = ({
  count,
  className,
  children,
  ...props
}: CommitFileAdditionsProps) => {
  if (count <= 0) {
    return null;
  }

  return (
    <span
      className={cn("text-green-600 dark:text-green-400", className)}
      {...props}
    >
      {children ?? (
        <>
          <PlusIcon className="inline-block size-3" />
          {count}
        </>
      )}
    </span>
  );
};

type CommitFileDeletionsProps = HTMLAttributes<HTMLSpanElement> & {
  count: number;
};

const CommitFileDeletions = ({
  count,
  className,
  children,
  ...props
}: CommitFileDeletionsProps) => {
  if (count <= 0) {
    return null;
  }

  return (
    <span
      className={cn("text-red-600 dark:text-red-400", className)}
      {...props}
    >
      {children ?? (
        <>
          <MinusIcon className="inline-block size-3" />
          {count}
        </>
      )}
    </span>
  );
};

export {
  Commit,
  CommitHeader,
  CommitHash,
  CommitMessage,
  CommitMetadata,
  CommitSeparator,
  CommitInfo,
  CommitAuthor,
  CommitAuthorAvatar,
  CommitTimestamp,
  CommitActions,
  CommitCopyButton,
  CommitContent,
  CommitFiles,
  CommitFile,
  CommitFileInfo,
  CommitFileStatus,
  CommitFileIcon,
  CommitFilePath,
  CommitFileChanges,
  CommitFileAdditions,
  CommitFileDeletions,
  type CommitProps,
  type CommitHeaderProps,
  type CommitHashProps,
  type CommitMessageProps,
  type CommitMetadataProps,
  type CommitSeparatorProps,
  type CommitInfoProps,
  type CommitAuthorProps,
  type CommitAuthorAvatarProps,
  type CommitTimestampProps,
  type CommitActionsProps,
  type CommitCopyButtonProps,
  type CommitContentProps,
  type CommitFilesProps,
  type CommitFileProps,
  type CommitFileInfoProps,
  type CommitFileStatusProps,
  type CommitFileIconProps,
  type CommitFilePathProps,
  type CommitFileChangesProps,
  type CommitFileAdditionsProps,
  type CommitFileDeletionsProps,
};
