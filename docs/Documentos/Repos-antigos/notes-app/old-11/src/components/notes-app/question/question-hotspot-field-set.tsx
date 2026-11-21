"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import type { ComponentProps } from "react";
import { QuestionHotspotToggle } from "@/components/notes-app/question/question-hotspot-toggle";
import { QuestionResultBadge } from "@/components/notes-app/question/question-result-badge";
import { Badge } from "@/components/ui/badge";
import { FieldLegend, FieldSet } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import type { HotspotArea, QuestionImage } from "@/types/question";

type QuestionHotspotFigureProps = Omit<
  ComponentProps<typeof FieldSet>,
  "children" | "onChange"
> & {
  legend: string;
  image: QuestionImage;
  areas: HotspotArea[];
  /** Ids of the selected areas. */
  value: readonly string[];
  /** The key, used to mark areas once `resolved`. */
  correctIds: readonly string[];
  resolved: boolean;
  onValueChange: (ids: string[]) => void;
};

type AreaResult = "correct" | "incorrect" | "missed" | undefined;

function areaResult(
  resolved: boolean,
  selected: boolean,
  isKey: boolean
): AreaResult {
  if (!resolved) {
    return undefined;
  }
  if (selected) {
    return isKey ? "correct" : "incorrect";
  }
  return isKey ? "missed" : undefined;
}

function QuestionHotspotFieldSet({
  legend,
  image,
  areas,
  value,
  correctIds,
  resolved,
  onValueChange,
  className,
  ...props
}: QuestionHotspotFigureProps) {
  const t = useTranslations("exam");

  const states = areas.map((area) => {
    const selected = value.includes(area.id);
    return {
      area,
      selected,
      result: areaResult(resolved, selected, correctIds.includes(area.id)),
    };
  });

  const toggle = (areaId: string, pressed: boolean) => {
    if (resolved) {
      return;
    }
    onValueChange(
      pressed ? [...value, areaId] : value.filter((id) => id !== areaId)
    );
  };

  return (
    <FieldSet
      data-slot="question-hotspot-figure"
      {...props}
      className={cn("min-w-0 gap-3", className)}
    >
      <FieldLegend className="sr-only">{legend}</FieldLegend>
      <p className="text-xs text-muted-foreground">{t("hotspotHint")}</p>
      <div className="relative w-full overflow-hidden rounded-lg border border-border bg-muted/30">
        <Image
          src={image.url}
          alt={image.alt}
          width={0}
          height={0}
          sizes="(min-width: 768px) 42rem, 100vw"
          unoptimized
          className="h-auto w-full"
        />
        {states.map(({ area, selected, result }) => (
          <QuestionHotspotToggle
            key={area.id}
            area={area}
            pressed={selected}
            result={result}
            disabled={resolved}
            aria-disabled={resolved || undefined}
            onPressedChange={(pressed) => toggle(area.id, pressed)}
          />
        ))}
      </div>
      {resolved ? (
        <ul className="flex flex-col gap-2 text-sm">
          {states
            .filter(({ result }) => result !== undefined)
            .map(({ area, result }) => (
              <li key={area.id} className="flex flex-wrap items-center gap-2">
                {result === "missed" ? (
                  <Badge variant="outline">{t("hotspotAreaMissed")}</Badge>
                ) : (
                  <QuestionResultBadge state={result ?? "incorrect"} />
                )}
                <span className="font-medium">{area.label}</span>
                {area.explanation ? (
                  <span className="text-muted-foreground">
                    {area.explanation}
                  </span>
                ) : null}
              </li>
            ))}
        </ul>
      ) : null}
    </FieldSet>
  );
}

export { QuestionHotspotFieldSet };
export type { QuestionHotspotFigureProps };
