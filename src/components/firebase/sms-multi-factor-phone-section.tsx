import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import type { Ref } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldTitle } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

type SmsMultiFactorPhoneSectionProps = useRender.ComponentProps<"div"> & {
  description: string;
  error: string | null;
  isPending: boolean;
  recaptchaContainerRef: Ref<HTMLDivElement>;
  onSendCode: () => Promise<void>;
  sendLabel: string;
  title: string;
};
function SmsMultiFactorPhoneSection({
  description,
  error,
  isPending,
  recaptchaContainerRef,
  onSendCode,
  sendLabel,
  title,
  className,
  render,
  ...props
}: SmsMultiFactorPhoneSectionProps) {
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(
      {
        className: cn("flex flex-col gap-4", className),
        children: (
          <>
            <Field>
              <FieldTitle>{title}</FieldTitle>
              <FieldDescription>{description}</FieldDescription>
            </Field>
            <div
              className="fui-recaptcha-container"
              ref={recaptchaContainerRef}
            />
            <Button
              type="button"
              onClick={onSendCode}
              disabled={isPending}
              focusableWhenDisabled
            >
              {isPending ? (
                <Spinner data-icon="inline-start" aria-hidden="true" />
              ) : null}
              {sendLabel}
            </Button>
            {error ? (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}
          </>
        ),
      },
      props,
    ),
    state: { slot: "sms-multi-factor-phone-section" },
  });
}

export { SmsMultiFactorPhoneSection };
