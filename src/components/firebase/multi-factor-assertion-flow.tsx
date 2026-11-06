import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import type { ComponentProps } from "react";
import { Button } from "@/components/ui/button";
import type { MultiFactorInfo } from "@/lib/firebase/multi-factor";
import { cn } from "@/lib/utils";

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
> & {
  factors: { hint: MultiFactorInfo; label: string }[];
  prompt: string;
  selectHint: (hint: MultiFactorInfo) => void;
};
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
