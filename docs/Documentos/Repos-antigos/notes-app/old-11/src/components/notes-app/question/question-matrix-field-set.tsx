"use client";

import { useTranslations } from "next-intl";
import { type ComponentProps, useId } from "react";
import { QuestionResultBadge } from "@/components/notes-app/question/question-result-badge";
import { FieldLegend, FieldSet } from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { MatrixColumn, MatrixRow } from "@/types/question";

interface QuestionMatrixTableProps
  extends Omit<ComponentProps<typeof FieldSet>, "children" | "onChange"> {
  legend: string;
  columns: MatrixColumn[];
  rows: MatrixRow[];
  value: Record<string, string>;
  correctAnswer: Record<string, string>;
  resolved: boolean;
  onValueChange: (value: Record<string, string>) => void;
}

function QuestionMatrixFieldSet({
  legend,
  columns,
  rows,
  value,
  correctAnswer,
  resolved,
  onValueChange,
  className,
  ...props
}: QuestionMatrixTableProps) {
  const t = useTranslations("exam");
  const groupId = useId();

  return (
    <FieldSet
      data-slot="question-matrix-group"
      {...props}
      className={cn("min-w-0 gap-3", className)}
    >
      <FieldLegend className="sr-only">{legend}</FieldLegend>
      <div className="overflow-x-auto rounded-lg border border-border">
        <Table data-slot="question-matrix-table">
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[60%] font-semibold">
                {t("matrixStatement")}
              </TableHead>
              {columns.map((col) => (
                <TableHead key={col.id} className="text-center font-semibold">
                  {col.label}
                </TableHead>
              ))}
              {resolved ? (
                <TableHead className="w-16 text-center">
                  {t("matrixResult")}
                </TableHead>
              ) : null}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => {
              const selected = value[row.id] ?? "";
              const isCorrect = resolved && selected === correctAnswer[row.id];
              const isIncorrect = resolved && selected !== "" && !isCorrect;
              const incorrectStatus = isIncorrect ? "incorrect" : undefined;
              const status = isCorrect ? "correct" : incorrectStatus;

              return (
                <TableRow
                  key={row.id}
                  data-slot="question-matrix-row"
                  data-status={status}
                  className={cn(
                    status === "correct" && "bg-primary/5",
                    status === "incorrect" && "bg-destructive/5"
                  )}
                >
                  <TableCell className="font-medium">{row.prompt}</TableCell>
                  {columns.map((col) => {
                    const cellId = `${groupId}-${row.id}-${col.id}`;

                    return (
                      <TableCell key={col.id} className="text-center">
                        <div className="flex justify-center">
                          <RadioGroup
                            value={selected}
                            disabled={resolved}
                            onValueChange={(val) =>
                              onValueChange({
                                ...value,
                                [row.id]: String(val),
                              })
                            }
                            className="flex justify-center"
                          >
                            <RadioGroupItem
                              id={cellId}
                              value={col.id}
                              aria-label={`${row.prompt}: ${col.label}`}
                            />
                          </RadioGroup>
                        </div>
                      </TableCell>
                    );
                  })}
                  {resolved ? (
                    <TableCell className="text-center">
                      {status ? <QuestionResultBadge state={status} /> : null}
                    </TableCell>
                  ) : null}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </FieldSet>
  );
}

export { QuestionMatrixFieldSet };
export type { QuestionMatrixTableProps };
