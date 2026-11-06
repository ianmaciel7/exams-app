"use client";

import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldTitle } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import type { MultiFactorInfo } from "@/lib/firebase/multi-factor";
import { cn } from "@/lib/utils";
import { useSmsMultiFactorPhoneSectionClient } from "../../_hooks/use-sms-multi-factor-phone-section-client";

type SmsMultiFactorPhoneSectionClientProps = useRender.ComponentProps<"div"> & {
  hint: MultiFactorInfo;
  onCodeSent: (verificationId: string) => void;
};

function SmsMultiFactorPhoneSectionClient({
  hint,
  onCodeSent,
  className,
  render,
  ...props
}: SmsMultiFactorPhoneSectionClientProps) {
  const {
    description,
    error,
    isPending,
    recaptchaContainerRef,
    sendCode,
    sendLabel,
    title,
  } = useSmsMultiFactorPhoneSectionClient({ hint, onCodeSent });

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
              onClick={sendCode}
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

export { SmsMultiFactorPhoneSectionClient };
