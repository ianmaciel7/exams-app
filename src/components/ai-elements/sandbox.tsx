"use client";

import type { ToolUIPart } from "ai";
import { ChevronDownIcon, Code } from "lucide-react";
import type { ComponentProps } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

import { getStatusBadge } from "./tool";

type SandboxRootProps = ComponentProps<typeof Collapsible>;

const Sandbox = ({ className, ...props }: SandboxRootProps) => (
  <Collapsible
    className={cn(
      "not-prose group mb-4 w-full overflow-hidden rounded-md border",
      className,
    )}
    defaultOpen
    {...props}
  />
);

interface SandboxHeaderProps {
  title?: string;
  state: ToolUIPart["state"];
  className?: string;
}

const SandboxHeader = ({
  className,
  title,
  state,
  ...props
}: SandboxHeaderProps) => (
  <CollapsibleTrigger
    className={cn(
      "flex w-full items-center justify-between gap-4 p-3",
      className,
    )}
    {...props}
  >
    <div className="flex items-center gap-2">
      <Code className="size-4 text-muted-foreground" />
      <span className="font-medium text-sm">{title}</span>
      {getStatusBadge(state)}
    </div>
    <ChevronDownIcon className="size-4 text-muted-foreground transition-transform group-data-open:rotate-180" />
  </CollapsibleTrigger>
);

type SandboxContentProps = ComponentProps<typeof CollapsibleContent>;

const SandboxContent = ({ className, ...props }: SandboxContentProps) => (
  <CollapsibleContent
    className={cn(
      "data-closed:fade-out-0 data-closed:slide-out-to-top-2 data-open:slide-in-from-top-2 outline-none data-closed:animate-out data-open:animate-in",
      className,
    )}
    {...props}
  />
);

type SandboxTabsProps = ComponentProps<typeof Tabs>;

const SandboxTabs = ({ className, ...props }: SandboxTabsProps) => (
  <Tabs className={cn("w-full gap-0", className)} {...props} />
);

type SandboxTabsBarProps = ComponentProps<"div">;

const SandboxTabsBar = ({ className, ...props }: SandboxTabsBarProps) => (
  <div
    className={cn(
      "flex w-full items-center border-border border-t border-b",
      className,
    )}
    {...props}
  />
);

type SandboxTabsListProps = ComponentProps<typeof TabsList>;

const SandboxTabsList = ({ className, ...props }: SandboxTabsListProps) => (
  <TabsList
    className={cn("h-auto rounded-none border-0 bg-transparent p-0", className)}
    {...props}
  />
);

type SandboxTabsTriggerProps = ComponentProps<typeof TabsTrigger>;

const SandboxTabsTrigger = ({
  className,
  ...props
}: SandboxTabsTriggerProps) => (
  <TabsTrigger
    className={cn(
      "rounded-none border-0 border-transparent border-b-2 px-4 py-2 font-medium text-muted-foreground text-sm transition-colors data-active:border-primary data-active:bg-transparent data-active:text-foreground data-active:shadow-none",
      className,
    )}
    {...props}
  />
);

type SandboxTabContentProps = ComponentProps<typeof TabsContent>;

const SandboxTabContent = ({ className, ...props }: SandboxTabContentProps) => (
  <TabsContent className={cn("mt-0 text-sm", className)} {...props} />
);

export {
  Sandbox,
  SandboxHeader,
  SandboxContent,
  SandboxTabs,
  SandboxTabsBar,
  SandboxTabsList,
  SandboxTabsTrigger,
  SandboxTabContent,
  type SandboxRootProps,
  type SandboxHeaderProps,
  type SandboxContentProps,
  type SandboxTabsProps,
  type SandboxTabsBarProps,
  type SandboxTabsListProps,
  type SandboxTabsTriggerProps,
  type SandboxTabContentProps,
};
