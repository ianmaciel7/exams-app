import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import type { ComponentProps } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { useMultiFactorAssertionFlowClient } from "../../_hooks/use-multi-factor-assertion-flow-client";

type MultiFactorAssertionFlowProps = useRender.ComponentProps<"div">;
function MultiFactorAssertionFlow({
  className,
  render,
  ...props
}: MultiFactorAssertionFlowProps) {
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(
      { className: cn("flex flex-col gap-2", className) },
      props,
    ),
    state: { slot: "multi-factor-assertion-flow" },
  });
}
type MultiFactorAssertionFlowPickerProps = ComponentProps<
  typeof MultiFactorAssertionFlow
> &
  Pick<
    ReturnType<typeof useMultiFactorAssertionFlowClient>,
    "factors" | "prompt" | "selectHint"
  >;
function MultiFactorAssertionFlowPicker({
  factors,
  prompt,
  selectHint,
  ...props
}: MultiFactorAssertionFlowPickerProps) {
  return (
    <MultiFactorAssertionFlow {...props}>
      <p className="text-sm text-muted-foreground">{prompt}</p>
      {factors.map((factor) => (
        <Button
          key={factor.hint.uid}
          type="button"
          onClick={() => selectHint(factor.hint)}
        >
          {factor.label}
        </Button>
      ))}
    </MultiFactorAssertionFlow>
  );
}

export { MultiFactorAssertionFlow, MultiFactorAssertionFlowPicker };
