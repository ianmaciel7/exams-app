import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/**
 * Form-level error (a failed submit, not one field). `role="alert"` makes
 * assistive technology announce it without moving focus.
 */
function FormError({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      role="alert"
      data-slot="form-error"
      className={cn("text-sm font-normal text-destructive", className)}
      {...props}
    />
  );
}

export { FormError };
