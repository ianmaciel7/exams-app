"use client";

import { asSchema, type Tool } from "ai";
import { BotIcon } from "lucide-react";
import type { ComponentProps } from "react";
import { memo, useEffect, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import { CodeBlock } from "./code-block";

type AgentProps = ComponentProps<"div">;

const Agent = memo(({ className, ...props }: AgentProps) => (
  <div
    className={cn("not-prose w-full rounded-md border", className)}
    {...props}
  />
));

type AgentHeaderProps = ComponentProps<"div"> & {
  name: string;
  model?: string;
};

const AgentHeader = memo(
  ({ className, name, model, ...props }: AgentHeaderProps) => (
    <div
      className={cn(
        "flex w-full items-center justify-between gap-4 p-3",
        className,
      )}
      {...props}
    >
      <div className="flex items-center gap-2">
        <BotIcon className="size-4 text-muted-foreground" />
        <span className="font-medium text-sm">{name}</span>
        {model && (
          <Badge className="font-mono text-xs" variant="secondary">
            {model}
          </Badge>
        )}
      </div>
    </div>
  ),
);

type AgentContentProps = ComponentProps<"div">;

const AgentContent = memo(({ className, ...props }: AgentContentProps) => (
  <div className={cn("space-y-4 p-4 pt-0", className)} {...props} />
));

type AgentInstructionsProps = ComponentProps<"div"> & {
  children: string;
};

const AgentInstructions = memo(
  ({ className, children, ...props }: AgentInstructionsProps) => (
    <div className={cn("space-y-2", className)} {...props}>
      <span className="font-medium text-muted-foreground text-sm">
        Instructions
      </span>
      <div className="rounded-md bg-muted/50 p-3 text-muted-foreground text-sm">
        <p>{children}</p>
      </div>
    </div>
  ),
);

type AgentToolsProps = ComponentProps<typeof Accordion>;

const AgentTools = memo(({ className, ...props }: AgentToolsProps) => (
  <div className={cn("space-y-2", className)}>
    <span className="font-medium text-muted-foreground text-sm">Tools</span>
    <Accordion className="rounded-md border" {...props} />
  </div>
));

type AgentToolProps = ComponentProps<typeof AccordionItem> & {
  tool: Tool;
};

const AgentTool = memo(
  ({ className, tool, value, ...props }: AgentToolProps) => {
    const [schema, setSchema] = useState<{ input: Tool["inputSchema"]; code: string } | null>(null);
    useEffect(() => {
      let cancelled = false;
      const resolveSchema = async () => {
        let code = "Schema unavailable";
        try {
          const json = await asSchema(tool.inputSchema).jsonSchema;
          code = JSON.stringify(json, null, 2) ?? code;
        } catch {
          // Unsupported or failed conversion must not break the tool accordion.
        }
        if (!cancelled) setSchema({ input: tool.inputSchema, code });
      };
      void resolveSchema();
      return () => { cancelled = true; };
    }, [tool.inputSchema]);
    const code = schema?.input === tool.inputSchema ? schema.code : "Loading schema…";

    return (
      <AccordionItem
        className={cn("border-b last:border-b-0", className)}
        value={value}
        {...props}
      >
        <AccordionTrigger className="px-3 py-2 text-sm hover:no-underline">
          {typeof tool.description === "string"
            ? tool.description
            : "No description"}
        </AccordionTrigger>
        <AccordionContent className="px-3 pb-3">
          <div className="rounded-md bg-muted/50">
            <CodeBlock code={code} language="json" />
          </div>
        </AccordionContent>
      </AccordionItem>
    );
  },
);

type AgentOutputProps = ComponentProps<"div"> & {
  schema: string;
};

const AgentOutput = memo(
  ({ className, schema, ...props }: AgentOutputProps) => (
    <div className={cn("space-y-2", className)} {...props}>
      <span className="font-medium text-muted-foreground text-sm">
        Output Schema
      </span>
      <div className="rounded-md bg-muted/50">
        <CodeBlock code={schema} language="typescript" />
      </div>
    </div>
  ),
);

Agent.displayName = "Agent";
AgentHeader.displayName = "AgentHeader";
AgentContent.displayName = "AgentContent";
AgentInstructions.displayName = "AgentInstructions";
AgentTools.displayName = "AgentTools";
AgentTool.displayName = "AgentTool";
AgentOutput.displayName = "AgentOutput";

export {
  Agent,
  AgentHeader,
  AgentContent,
  AgentInstructions,
  AgentTools,
  AgentTool,
  AgentOutput,
  type AgentProps,
  type AgentHeaderProps,
  type AgentContentProps,
  type AgentInstructionsProps,
  type AgentToolsProps,
  type AgentToolProps,
  type AgentOutputProps,
};
