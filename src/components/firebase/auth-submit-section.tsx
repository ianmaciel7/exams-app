import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/ui/extensions/form-error";
import { Spinner } from "@/components/ui/spinner";

type AuthSubmitSectionProps = useRender.ComponentProps<"div"> & {
  policies?: ReactNode;
  error?: string;
  isPending: boolean;
  submitLabel: string;
};

function AuthSubmitSection({
  policies,
  error,
  isPending,
  submitLabel,
  render,
  ...props
}: AuthSubmitSectionProps) {
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(
      {
        className: "flex flex-col gap-4",
        children: (
          <>
            {policies}
            <Button type="submit" disabled={isPending} focusableWhenDisabled>
              {isPending ? (
                <Spinner data-icon="inline-start" aria-hidden="true" />
              ) : null}
              {submitLabel}
            </Button>
            {error ? <FormError>{error}</FormError> : null}
          </>
        ),
      },
      props,
    ),
    state: { slot: "auth-submit-section" },
  });
}

export { AuthSubmitSection };
