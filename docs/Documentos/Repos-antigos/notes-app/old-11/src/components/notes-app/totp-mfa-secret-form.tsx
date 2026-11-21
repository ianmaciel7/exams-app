"use client";

import {
  FirebaseUIError,
  generateTotpSecret,
  getTranslation,
} from "@firebase-oss/ui-core";
import {
  useMultiFactorTotpAuthNumberFormSchema,
  useUI,
} from "@firebase-oss/ui-react";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import type { TotpSecret } from "firebase/auth";
import type { ComponentProps } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { AuthFormErrorAlert } from "@/components/notes-app/auth-form-error-alert";
import { AuthFormInput } from "@/components/notes-app/auth-form-input";
import { AuthSubmitButton } from "@/components/notes-app/auth-submit-button";
import { FieldGroup } from "@/components/ui/field";
import { cn } from "@/lib/utils";

type TotpMfaSecretFormProps = Omit<ComponentProps<"form">, "onSubmit"> & {
  onSubmit: (secret: TotpSecret, displayName: string) => void;
};

function TotpMfaSecretForm({
  onSubmit: onSubmitProp,
  className,
  ...props
}: TotpMfaSecretFormProps) {
  const ui = useUI();
  const schema = useMultiFactorTotpAuthNumberFormSchema();

  const form = useForm<{ displayName: string }>({
    resolver: standardSchemaResolver(schema),
    mode: "onChange",
    defaultValues: {
      displayName: "",
    },
  });

  const onSubmit = async (values: { displayName: string }) => {
    try {
      const secret = await generateTotpSecret(ui);
      onSubmitProp(secret, values.displayName);
    } catch (error) {
      const message =
        error instanceof FirebaseUIError ? error.message : String(error);
      form.setError("root", { message });
    }
  };

  return (
    <FormProvider {...form}>
      <form
        data-slot="totp-mfa-secret-form"
        onSubmit={form.handleSubmit(onSubmit)}
        {...props}
        className={cn("flex flex-col gap-4", className)}
      >
        <FieldGroup>
          <AuthFormInput
            name="displayName"
            type="text"
            label={getTranslation(ui, "labels", "displayName")}
          />
          <AuthSubmitButton type="submit" busy={ui.state !== "idle"}>
            {getTranslation(ui, "labels", "generateQrCode")}
          </AuthSubmitButton>
          <AuthFormErrorAlert message={form.formState.errors.root?.message} />
        </FieldGroup>
      </form>
    </FormProvider>
  );
}

export { TotpMfaSecretForm, type TotpMfaSecretFormProps };
