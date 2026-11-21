"use client";

import {
  enrollWithMultiFactorAssertion,
  FirebaseUIError,
  getTranslation,
} from "@firebase-oss/ui-core";
import {
  useMultiFactorPhoneAuthVerifyFormSchema,
  useUI,
} from "@firebase-oss/ui-react";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { PhoneAuthProvider, PhoneMultiFactorGenerator } from "firebase/auth";
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

type SmsMfaVerifyFormProps = Omit<ComponentProps<"form">, "onSubmit"> & {
  verificationId: string;
  displayName?: string;
  onSuccess: () => void;
};

function SmsMfaVerifyForm({
  verificationId,
  displayName,
  onSuccess,
  className,
  ...props
}: SmsMfaVerifyFormProps) {
  const ui = useUI();
  const schema = useMultiFactorPhoneAuthVerifyFormSchema();

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
      const credential = PhoneAuthProvider.credential(
        values.verificationId,
        values.verificationCode
      );
      const assertion = PhoneMultiFactorGenerator.assertion(credential);
      await enrollWithMultiFactorAssertion(ui, assertion, displayName);
      onSuccess();
    } catch (error) {
      const message =
        error instanceof FirebaseUIError ? error.message : String(error);
      form.setError("root", { message });
    }
  };

  return (
    <FormProvider {...form}>
      <form
        data-slot="sms-mfa-verify-form"
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

export { SmsMfaVerifyForm, type SmsMfaVerifyFormProps };
