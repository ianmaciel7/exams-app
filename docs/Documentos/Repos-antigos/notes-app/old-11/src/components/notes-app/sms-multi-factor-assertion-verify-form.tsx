"use client";

import { FirebaseUIError, getTranslation } from "@firebase-oss/ui-core";
import {
  useMultiFactorPhoneAuthVerifyFormSchema,
  useSmsMultiFactorAssertionVerifyFormAction,
  useUI,
} from "@firebase-oss/ui-react";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import type { UserCredential } from "firebase/auth";
import type { ComponentProps } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

type SmsMultiFactorAssertionVerifyFormProps = Omit<
  ComponentProps<"form">,
  "onSubmit"
> & {
  verificationId: string;
  onSuccess: (credential: UserCredential) => void;
};

function SmsMultiFactorAssertionVerifyForm({
  verificationId,
  onSuccess,
  className,
  ...props
}: SmsMultiFactorAssertionVerifyFormProps) {
  const ui = useUI();
  const schema = useMultiFactorPhoneAuthVerifyFormSchema();
  const action = useSmsMultiFactorAssertionVerifyFormAction();

  const form = useForm<{ verificationId: string; verificationCode: string }>({
    resolver: standardSchemaResolver(schema),
    mode: "onChange",
    defaultValues: {
      verificationId,
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
      onSuccess(credential);
    } catch (error) {
      const message =
        error instanceof FirebaseUIError ? error.message : String(error);
      form.setError("root", { message });
    }
  };

  return (
    <FormProvider {...form}>
      <form
        data-slot="sms-multi-factor-assertion-verify-form"
        onSubmit={form.handleSubmit(onSubmit)}
        {...props}
        className={cn("flex flex-col gap-4", className)}
      >
        <FieldGroup>
          <Controller
            control={form.control}
            name="verificationCode"
            render={({ field, fieldState }) => (
              <Field data-invalid={!!fieldState.error}>
                <FieldLabel htmlFor="verificationCode">
                  {getTranslation(ui, "labels", "verificationCode")}
                </FieldLabel>
                <FieldDescription>
                  {getTranslation(ui, "prompts", "smsVerificationPrompt")}
                </FieldDescription>
                <InputOTP
                  id="verificationCode"
                  maxLength={6}
                  {...field}
                  aria-invalid={!!fieldState.error}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
                {fieldState.error && (
                  <FieldError>{fieldState.error.message}</FieldError>
                )}
              </Field>
            )}
          />
          <Button type="submit" disabled={ui.state !== "idle"}>
            {ui.state !== "idle" && <Spinner data-icon="inline-start" />}
            {getTranslation(ui, "labels", "verifyCode")}
          </Button>
          {form.formState.errors.root && (
            <Alert variant="destructive">
              <AlertDescription>
                {form.formState.errors.root.message}
              </AlertDescription>
            </Alert>
          )}
        </FieldGroup>
      </form>
    </FormProvider>
  );
}

export {
  SmsMultiFactorAssertionVerifyForm,
  type SmsMultiFactorAssertionVerifyFormProps,
};
