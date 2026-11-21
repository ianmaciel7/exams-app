"use client";

import { FirebaseUIError, getTranslation } from "@firebase-oss/ui-core";
import {
  useRecaptchaVerifier,
  useSmsMultiFactorAssertionPhoneFormAction,
  useUI,
} from "@firebase-oss/ui-react";
import type { MultiFactorInfo } from "firebase/auth";
import type { ComponentProps } from "react";
import { useRef, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldTitle,
} from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

type PhoneMultiFactorInfo = MultiFactorInfo & {
  phoneNumber?: string;
};

type SmsMultiFactorAssertionPhoneFormProps = Omit<
  ComponentProps<typeof FieldGroup>,
  "onSubmit"
> & {
  hint: MultiFactorInfo;
  onSubmit: (verificationId: string) => void;
};

function SmsMultiFactorAssertionPhoneForm({
  hint,
  onSubmit: onSubmitProp,
  className,
  ...props
}: SmsMultiFactorAssertionPhoneFormProps) {
  const ui = useUI();
  const recaptchaContainerRef = useRef<HTMLDivElement>(null);
  const recaptchaVerifier = useRecaptchaVerifier(recaptchaContainerRef);
  const action = useSmsMultiFactorAssertionPhoneFormAction();
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    try {
      setError(null);
      const verifier = recaptchaVerifier;
      if (!verifier) {
        setError(getTranslation(ui, "errors", "unknownError"));
        return;
      }
      const verificationId = await action({
        hint,
        recaptchaVerifier: verifier,
      });
      onSubmitProp(verificationId);
    } catch (error) {
      const message =
        error instanceof FirebaseUIError ? error.message : String(error);
      setError(message);
    }
  };

  return (
    <FieldGroup
      data-slot="sms-multi-factor-assertion-phone-form"
      {...props}
      className={cn(className)}
    >
      <FieldGroup className="gap-4">
        <Field>
          <FieldTitle>{getTranslation(ui, "labels", "phoneNumber")}</FieldTitle>
          <FieldDescription>
            {getTranslation(ui, "messages", "mfaSmsAssertionPrompt", {
              phoneNumber: (hint as PhoneMultiFactorInfo).phoneNumber || "",
            })}
          </FieldDescription>
        </Field>
        <div className="fui-recaptcha-container" ref={recaptchaContainerRef} />
        <Button onClick={onSubmit} disabled={ui.state !== "idle"}>
          {ui.state !== "idle" && <Spinner data-icon="inline-start" />}
          {getTranslation(ui, "labels", "sendCode")}
        </Button>
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </FieldGroup>
    </FieldGroup>
  );
}

export {
  SmsMultiFactorAssertionPhoneForm,
  type SmsMultiFactorAssertionPhoneFormProps,
};
