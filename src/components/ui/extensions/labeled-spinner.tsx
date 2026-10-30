import type { ComponentProps } from "react";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

type LabeledSpinnerProps = ComponentProps<"span">;

function LabeledSpinner({
  children,
  className,
  ...props
}: LabeledSpinnerProps) {
  return (
    <span
      data-slot="labeled-spinner"
      {...props}
      role="status"
      aria-live="polite"
      className={cn(
        "inline-flex items-center justify-center gap-2 text-sm text-muted-foreground",
        className,
      )}
    >
      <Spinner
        role="presentation"
        aria-hidden="true"
        aria-label={undefined}
        className="shrink-0 motion-reduce:animate-none"
      />
      {children ? <span>{children}</span> : null}
    </span>
  );
}

export { LabeledSpinner };
