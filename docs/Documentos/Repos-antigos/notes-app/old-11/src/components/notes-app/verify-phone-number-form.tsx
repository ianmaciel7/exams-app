"use client";

import {
  FirebaseUIError,
  getTranslation,
  type PhoneAuthVerifyFormSchema,
} from "@firebase-oss/ui-core";
import {
  usePhoneAuthVerifyFormSchema,
  useUI,
  useVerifyPhoneNumberFormAction,
} from "@firebase-oss/ui-react";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import type { UserCredential } from "firebase/auth";
import type { ComponentProps } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { AuthFormErrorAlert } from "@/components/notes-app/auth-form-error-alert";
import { AuthSubmitButton } from "@/components/notes-app/auth-submit-button";
import { VerificationCodeInput } from "@/components/notes-app/verification-code-input";
import { FieldGroup } from "@/components/ui/field";
import { cn } from "@/lib/utils";

type VerifyPhoneNumberFormProps = Omit<ComponentProps<"form">, "onSubmit"> & {
  verificationId: string;
  onSuccess: (credential: UserCredential) => void;
};

function VerifyPhoneNumberForm({
  verificationId,
  onSuccess,
  className,
  ...props
}: VerifyPhoneNumberFormProps) {
  const ui = useUI();
  const schema = usePhoneAuthVerifyFormSchema();
  const action = useVerifyPhoneNumberFormAction();

  const form = useForm<PhoneAuthVerifyFormSchema>({
    resolver: standardSchemaResolver(schema),
    mode: "onChange",
    defaultValues: {
      verificationId,
      verificationCode: "",
    },
  });

  const onSubmit = async (values: PhoneAuthVerifyFormSchema) => {
    try {
      const credential = await action(values);
      if (credential) {
        onSuccess(credential);
      }
    } catch (error) {
      const message =
        error instanceof FirebaseUIError ? error.message : String(error);
      form.setError("root", { message });
    }
  };

  return (
    <FormProvider {...form}>
      <form
        data-slot="verify-phone-number-form"
        onSubmit={(event) => {
          event.preventDefault();
          void form.handleSubmit(onSubmit)(event);
        }}
        className={cn("flex flex-col gap-4", className)}
        {...props}
      >
        <FieldGroup>
          <VerificationCodeInput
            label={getTranslation(ui, "labels", "verificationCode")}
            description={getTranslation(ui, "prompts", "smsVerificationPrompt")}
          />
          <AuthSubmitButton type="submit" busy={ui.state !== "idle"}>
            {getTranslation(ui, "labels", "verifyCode")}
          </AuthSubmitButton>
          <AuthFormErrorAlert message={form.formState.errors.root?.message} />
        </FieldGroup>
      </form>
    </FormProvider>
  );
}

export { VerifyPhoneNumberForm, type VerifyPhoneNumberFormProps };
