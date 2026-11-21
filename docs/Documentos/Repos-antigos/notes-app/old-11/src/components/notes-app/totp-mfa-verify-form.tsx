"use client";

import {
  enrollWithMultiFactorAssertion,
  FirebaseUIError,
  generateTotpQrCode,
  getTranslation,
} from "@firebase-oss/ui-core";
import {
  useMultiFactorTotpAuthVerifyFormSchema,
  useUI,
} from "@firebase-oss/ui-react";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { TotpMultiFactorGenerator, type TotpSecret } from "firebase/auth";
import Image from "next/image";
import { useTranslations } from "next-intl";
import type { ComponentProps } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { AuthFormErrorAlert } from "@/components/notes-app/auth-form-error-alert";
import { AuthSubmitButton } from "@/components/notes-app/auth-submit-button";
import { VerificationCodeInput } from "@/components/notes-app/verification-code-input";
import { Field, FieldDescription, FieldGroup } from "@/components/ui/field";
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";
import { cn } from "@/lib/utils";

type TotpMfaVerifyFormProps = ComponentProps<typeof FieldGroup> & {
  secret: TotpSecret;
  displayName: string;
  onSuccess: () => void;
};

function TotpMfaVerifyForm({
  secret,
  displayName,
  onSuccess,
  className,
  ...props
}: TotpMfaVerifyFormProps) {
  const ui = useUI();
  const t = useTranslations("auth");
  const schema = useMultiFactorTotpAuthVerifyFormSchema();

  const form = useForm<{ verificationCode: string }>({
    resolver: standardSchemaResolver(schema),
    mode: "onChange",
    defaultValues: {
      verificationCode: "",
    },
  });

  const onSubmit = async (values: { verificationCode: string }) => {
    try {
      const assertion = TotpMultiFactorGenerator.assertionForEnrollment(
        secret,
        values.verificationCode
      );
      await enrollWithMultiFactorAssertion(
        ui,
        assertion,
        values.verificationCode
      );
      onSuccess();
    } catch (error) {
      const message =
        error instanceof FirebaseUIError ? error.message : String(error);
      form.setError("root", { message });
    }
  };

  const qrCodeDataUrl = generateTotpQrCode(ui, secret, displayName);

  return (
    <FieldGroup
      {...props}
      data-slot="totp-mfa-verify-form"
      className={cn("gap-4", className)}
    >
      <Field className="items-center justify-center">
        <Image
          src={qrCodeDataUrl}
          alt={t("totpQrCodeAlt")}
          width={192}
          height={192}
          unoptimized
          className="mx-auto"
        />
        <InputGroup>
          <InputGroupInput
            readOnly
            value={secret.secretKey.toString()}
            aria-label={t("totpSecret")}
          />
        </InputGroup>
        <FieldDescription className="text-center">
          {getTranslation(ui, "prompts", "mfaTotpQrCodePrompt")}
        </FieldDescription>
      </Field>
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

export { TotpMfaVerifyForm, type TotpMfaVerifyFormProps };
