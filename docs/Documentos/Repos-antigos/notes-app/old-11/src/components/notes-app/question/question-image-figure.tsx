import Image from "next/image";
import type { ComponentProps } from "react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { cn } from "@/lib/utils";

type QuestionImageFigureProps = Omit<
  ComponentProps<typeof AspectRatio>,
  "children" | "ratio"
> & {
  url: string;
  alt: string;
};

/**
 * A fixed-ratio frame so a remote image never shifts the layout while loading.
 */
function QuestionImageFigure({
  url,
  alt,
  className,
  style,
  ...props
}: QuestionImageFigureProps) {
  return (
    <AspectRatio
      data-slot="question-image-figure"
      ratio={16 / 9}
      style={{ position: "relative", ...style }}
      {...props}
      className={cn(
        "relative w-full overflow-hidden rounded-lg border border-border bg-muted/30",
        className
      )}
    >
      <Image
        src={url}
        alt={alt}
        fill
        unoptimized
        sizes="(min-width: 768px) 42rem, 100vw"
        className="object-contain"
      />
    </AspectRatio>
  );
}

export { QuestionImageFigure, type QuestionImageFigureProps };
