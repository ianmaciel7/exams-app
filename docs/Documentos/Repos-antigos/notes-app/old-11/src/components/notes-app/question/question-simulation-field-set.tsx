"use client";

import { PlayIcon, TerminalIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ComponentProps } from "react";
import { useState } from "react";
import { QuestionResultBadge } from "@/components/notes-app/question/question-result-badge";
import { Button } from "@/components/ui/button";
import { FieldLegend, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface QuestionSimulationCardProps
  extends Omit<ComponentProps<typeof FieldSet>, "children" | "onChange"> {
  legend: string;
  scenarioDescription: string;
  terminalPrompt?: string;
  allowedCommands: string[];
  correctAnswer: string[];
  value: string[];
  resolved: boolean;
  onValueChange: (value: string[]) => void;
}

function QuestionSimulationFieldSet({
  legend,
  scenarioDescription,
  terminalPrompt = "cloudshell:~$",
  allowedCommands,
  correctAnswer,
  value,
  resolved,
  onValueChange,
  className,
  ...props
}: QuestionSimulationCardProps) {
  const t = useTranslations("exam");
  const [currentInput, setCurrentInput] = useState("");

  const handleExecute = (e?: React.FormEvent) => {
    e?.preventDefault();
    const cmd = currentInput.trim();
    if (!cmd || resolved) {
      return;
    }

    onValueChange([...value, cmd]);
    setCurrentInput("");
  };

  const isCompleted =
    resolved &&
    correctAnswer.every((exp) =>
      value
        .map((v) => v.toLowerCase().trim())
        .includes(exp.toLowerCase().trim())
    );

  const resolvedStatus = isCompleted ? "correct" : "incorrect";
  const status = resolved ? resolvedStatus : undefined;

  return (
    <FieldSet
      data-slot="question-simulation-group"
      {...props}
      className={cn("min-w-0 gap-3", className)}
    >
      <FieldLegend className="sr-only">{legend}</FieldLegend>

      {/* Scenario Brief */}
      <div className="rounded-lg border border-border bg-muted/30 p-3 text-sm text-foreground">
        <span className="font-semibold text-foreground">
          {t("simulationObjective")}{" "}
        </span>
        {scenarioDescription}
      </div>

      {/* Terminal Container */}
      <div
        data-slot="question-simulation-terminal"
        className="flex flex-col rounded-lg border border-border bg-card font-mono text-xs text-card-foreground shadow-xs"
      >
        {/* Terminal Header */}
        <div className="flex items-center justify-between border-b border-border bg-muted/60 px-3 py-1.5">
          <div className="flex items-center gap-2 text-muted-foreground">
            <TerminalIcon className="size-3.5" />
            <span className="text-xs font-medium">{t("simulationTitle")}</span>
          </div>
          {status ? <QuestionResultBadge state={status} /> : null}
        </div>

        {/* Terminal History */}
        <div className="flex max-h-56 min-h-28 flex-col gap-1.5 overflow-y-auto p-3">
          <div className="text-muted-foreground">{t("simulationBanner")}</div>
          {value.map((cmd, idx) => {
            const entryKey = `cmd-${idx}-${cmd.slice(0, 10)}`;
            return (
              <div key={entryKey} className="flex items-center gap-2">
                <span className="font-semibold text-primary select-none">
                  {terminalPrompt}
                </span>
                <span className="text-foreground">{cmd}</span>
              </div>
            );
          })}
        </div>

        {/* Terminal Input Bar */}
        {!resolved ? (
          <form
            onSubmit={handleExecute}
            className="flex items-center gap-2 border-t border-border bg-muted/30 p-2"
          >
            <span className="pl-1 font-semibold text-primary select-none">
              {terminalPrompt}
            </span>
            <Input
              type="text"
              value={currentInput}
              disabled={resolved}
              onChange={(e) => setCurrentInput(e.target.value)}
              placeholder={t("simulationPlaceholder")}
              className="h-8 flex-1 font-mono text-xs"
            />
            <Button type="submit" size="sm" variant="secondary">
              <PlayIcon className="size-3" />
              {t("simulationRun")}
            </Button>
          </form>
        ) : null}
      </div>
    </FieldSet>
  );
}

export { QuestionSimulationFieldSet };
export type { QuestionSimulationCardProps };
