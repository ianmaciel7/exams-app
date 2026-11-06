import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cn } from "@/lib/utils";

/**
 * Form-level error (a failed submit, not one field). `role="alert"` makes
 * assistive technology announce it without moving focus.
 */
function FormError({
  className,
  render,
  ...props
}: useRender.ComponentProps<"div">) {
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(
      {
        role: "alert",
        className: cn("text-sm font-normal text-destructive", className),
      },
      props,
    ),
    state: { slot: "form-error" },
  });
}

export { FormError };
