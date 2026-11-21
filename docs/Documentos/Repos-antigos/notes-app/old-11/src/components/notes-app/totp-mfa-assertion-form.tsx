"use client";

import { FirebaseUIError, getTranslation } from "@firebase-oss/ui-core";
import {
  useMultiFactorTotpAuthVerifyFormSchema,
  useTotpMultiFactorAssertionFormAction,
  useUI,
} from "@firebase-oss/ui-react";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import type { MultiFactorInfo, UserCredential } from "firebase/auth";
import type { ComponentProps } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { AuthFormErrorAlert } from "@/components/notes-app/auth-form-error-alert";
import { AuthSubmitButton } from "@/components/notes-app/auth-submit-button";
import { VerificationCodeInput } from "@/components/notes-app/verification-code-input";
import { FieldGroup } from "@/components/ui/field";
import { cn } from "@/lib/utils";

type TotpMfaAssertionFormProps = ComponentProps<typeof FieldGroup> & {
  hint: MultiFactorInfo;
  onSuccess?: (credential: UserCredential) => void;
};

function TotpMfaAssertionForm({
  hint,
  onSuccess,
  className,
  ...props
}: TotpMfaAssertionFormProps) {
  const ui = useUI();
  const schema = useMultiFactorTotpAuthVerifyFormSchema();
  const action = useTotpMultiFactorAssertionFormAction();

  const form = useForm<{ verificationCode: string }>({
    resolver: standardSchemaResolver(schema),
    mode: "onChange",
    defaultValues: {
      verificationCode: "",
    },
  });

  const onSubmit = async (values: { verificationCode: string }) => {
    try {
      const credential = await action({
        verificationCode: values.verificationCode,
        hint,
      });
      onSuccess?.(credential);
    } catch (error) {
      const message =
        error instanceof FirebaseUIError ? error.message : String(error);
      form.setError("root", { message });
    }
  };

  return (
    <FieldGroup
      data-slot="totp-mfa-assertion-form"
      {...props}
      className={cn(className)}
    >
      <FormProvider {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
        >
          <FieldGroup>
            <VerificationCodeInput
              label={getTranslation(ui, "labels", "verificationCode")}
            />
            <AuthSubmitButton type="submit" busy={ui.state !== "idle"}>
              {getTranslation(ui, "labels", "verifyCode")}
            </AuthSubmitButton>
            <AuthFormErrorAlert message={form.formState.errors.root?.message} />
          </FieldGroup>
        </form>
      </FormProvider>
    </FieldGroup>
  );
}

export { TotpMfaAssertionForm, type TotpMfaAssertionFormProps };
