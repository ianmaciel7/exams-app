"use client";

import type { ComponentProps } from "react";
import { Toggle } from "@/components/ui/toggle";
import { areaBox, areaClipPath } from "@/lib/exam/hotspot-geometry";
import { cn } from "@/lib/utils";
import type { HotspotArea } from "@/types/question";

type QuestionHotspotToggleProps = Omit<
  ComponentProps<typeof Toggle>,
  "children" | "aria-label" | "render" | "style"
> & {
  area: HotspotArea;
  /** Set once graded: right pick, wrong pick, or a key area left unselected. */
  result?: "correct" | "incorrect" | "missed";
};

/**
 * A clickable region over the image, placed by the area's bounding box and cut
 * to its shape. It is a toggle button, so it is focusable and announced as
 * pressed or not without any extra ARIA.
 */
function QuestionHotspotToggle({
  area,
  result,
  className,
  ...props
}: QuestionHotspotToggleProps) {
  const box = areaBox(area.shape);

  return (
    <Toggle
      data-slot="question-hotspot-toggle"
      data-result={result}
      data-shape={area.shape.kind}
      {...props}
      aria-label={area.label}
      style={{
        left: `${box.left}%`,
        top: `${box.top}%`,
        width: `${box.width}%`,
        height: `${box.height}%`,
        clipPath: areaClipPath(area.shape),
      }}
      className={cn(
        "absolute min-w-0 p-0 transition-colors",
        "border-2 border-dashed border-primary/60 bg-primary/5 hover:bg-primary/15",
        "data-[shape=circle]:rounded-full",
        "data-[shape=polygon]:border-0 data-[shape=polygon]:[filter:drop-shadow(0_0_1px_rgba(0,0,0,0.8))_drop-shadow(0_0_2px_rgba(255,255,255,0.8))]",
        "data-pressed:border-solid data-pressed:border-primary data-pressed:bg-primary/25",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset focus-visible:bg-ring/40 focus-visible:outline-none",
        "data-[result=correct]:border-solid data-[result=correct]:border-primary data-[result=correct]:bg-primary/30",
        "data-[result=incorrect]:border-solid data-[result=incorrect]:border-destructive data-[result=incorrect]:bg-destructive/30",
        "data-[result=missed]:border-primary data-[result=missed]:bg-primary/15",
        className
      )}
    />
  );
}

export { QuestionHotspotToggle, type QuestionHotspotToggleProps };
