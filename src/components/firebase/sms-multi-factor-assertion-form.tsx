"use client";

import { getTranslation } from "@firebase-oss/ui-core";
import {
  useMultiFactorPhoneAuthVerifyFormSchema,
  useRecaptchaVerifier,
  useSmsMultiFactorAssertionPhoneFormAction,
  useSmsMultiFactorAssertionVerifyFormAction,
  useUI,
} from "@firebase-oss/ui-react";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import type { MultiFactorInfo, UserCredential } from "firebase/auth";
import { useRef, useState } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/extensions/form";
import { FormError } from "@/components/ui/extensions/form-error";
import { VerificationCodeField } from "@/components/ui/extensions/verification-code-field";
import { Field, FieldDescription, FieldTitle } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { getAuthActionErrorMessage } from "@/lib/firebase/auth-error-message";

type PhoneMultiFactorInfo = MultiFactorInfo & {
  phoneNumber?: string;
};

type SmsMultiFactorAssertionPhoneFormProps = {
  hint: MultiFactorInfo;
  onSubmit: (verificationId: string) => void;
};

function SmsMultiFactorAssertionPhoneForm(
  props: SmsMultiFactorAssertionPhoneFormProps,
) {
  const ui = useUI();
  const recaptchaContainerRef = useRef<HTMLDivElement>(null);
  const recaptchaVerifier = useRecaptchaVerifier(recaptchaContainerRef);
  const action = useSmsMultiFactorAssertionPhoneFormAction();
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    try {
      setError(null);
      const verificationId = await action({
        hint: props.hint,
        recaptchaVerifier: recaptchaVerifier!,
      });
      props.onSubmit(verificationId);
    } catch (error) {
      setError(getAuthActionErrorMessage(error, ui));
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <Field>
        <FieldTitle>{getTranslation(ui, "labels", "phoneNumber")}</FieldTitle>
        <FieldDescription>
          {getTranslation(ui, "messages", "mfaSmsAssertionPrompt", {
            phoneNumber: (props.hint as PhoneMultiFactorInfo).phoneNumber || "",
          })}
        </FieldDescription>
      </Field>
      <div className="fui-recaptcha-container" ref={recaptchaContainerRef} />
      <Button
        type="button"
        onClick={onSubmit}
        disabled={ui.state !== "idle"}
        focusableWhenDisabled
      >
        {ui.state !== "idle" ? (
          <>
            <Spinner data-icon="inline-start" aria-hidden="true" />
            {getTranslation(ui, "labels", "sendCode")}
          </>
        ) : (
          getTranslation(ui, "labels", "sendCode")
        )}
      </Button>
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}

type SmsMultiFactorAssertionVerifyFormProps = {
  verificationId: string;
  onSuccess: (credential: UserCredential) => void;
};

function SmsMultiFactorAssertionVerifyForm(
  props: SmsMultiFactorAssertionVerifyFormProps,
) {
  const ui = useUI();
  const schema = useMultiFactorPhoneAuthVerifyFormSchema();
  const action = useSmsMultiFactorAssertionVerifyFormAction();

  const form = useForm<{ verificationId: string; verificationCode: string }>({
    resolver: standardSchemaResolver(schema),
    mode: "onChange",
    defaultValues: {
      verificationId: props.verificationId,
      verificationCode: "",
    },
  });

  const onSubmit = async (values: {
    verificationId: string;
    verificationCode: string;
  }) => {
    try {
      const credential = await action({
        verificationId: values.verificationId,
        verificationCode: values.verificationCode,
      });
      props.onSuccess(credential);
    } catch (error) {
      form.setError("root", { message: getAuthActionErrorMessage(error, ui) });
    }
  };

  return (
    <FormProvider {...form}>
      <Form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-y-4"
      >
        <Controller
          control={form.control}
          name="verificationCode"
          render={({ field, fieldState }) => (
            <VerificationCodeField
              name={field.name}
              label={getTranslation(ui, "labels", "verificationCode")}
              description={getTranslation(
                ui,
                "prompts",
                "smsVerificationPrompt",
              )}
              value={field.value}
              onValueChange={field.onChange}
              onBlur={field.onBlur}
              error={fieldState.error?.message}
            />
          )}
        />
        <Button
          type="submit"
          disabled={ui.state !== "idle"}
          focusableWhenDisabled
        >
          {ui.state !== "idle" ? (
            <>
              <Spinner data-icon="inline-start" aria-hidden="true" />
              {getTranslation(ui, "labels", "verifyCode")}
            </>
          ) : (
            getTranslation(ui, "labels", "verifyCode")
          )}
        </Button>
        {form.formState.errors.root && (
          <FormError>{form.formState.errors.root.message}</FormError>
        )}
      </Form>
    </FormProvider>
  );
}

type SmsMultiFactorAssertionFormProps = {
  hint: MultiFactorInfo;
  onSuccess?: (credential: UserCredential) => void;
};

function SmsMultiFactorAssertionForm(props: SmsMultiFactorAssertionFormProps) {
  const [verification, setVerification] = useState<{
    verificationId: string;
  } | null>(null);

  if (!verification) {
    return (
      <SmsMultiFactorAssertionPhoneForm
        hint={props.hint}
        onSubmit={(verificationId) => setVerification({ verificationId })}
      />
    );
  }

  return (
    <SmsMultiFactorAssertionVerifyForm
      verificationId={verification.verificationId}
      onSuccess={(credential) => {
        props.onSuccess?.(credential);
      }}
    />
  );
}

export { SmsMultiFactorAssertionForm };
