"use client";

import { useState } from "react";
import { TotpMultiFactorGenerator, type TotpSecret } from "firebase/auth";
import {
  enrollWithMultiFactorAssertion,
  FirebaseUIError,
  generateTotpQrCode,
  generateTotpSecret,
  getTranslation,
} from "@firebase-oss/ui-core";
import {
  useMultiFactorTotpAuthNumberFormSchema,
  useMultiFactorTotpAuthVerifyFormSchema,
  useUI,
} from "@firebase-oss/ui-react";
import { useForm, FormProvider, Controller } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";

import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

type TotpMultiFactorSecretGenerationFormProps = {
  onSubmit: (secret: TotpSecret, displayName: string) => void;
};

function TotpMultiFactorSecretGenerationForm(props: TotpMultiFactorSecretGenerationFormProps) {
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
      props.onSubmit(secret, values.displayName);
    } catch (error) {
      const message = error instanceof FirebaseUIError ? error.message : String(error);
      form.setError("root", { message });
    }
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-y-4">
        <Controller
          control={form.control}
          name="displayName"
          render={({ field, fieldState }) => (
            <Field data-invalid={!!fieldState.error}>
              <FieldLabel htmlFor="displayName">{getTranslation(ui, "labels", "displayName")}</FieldLabel>
              <Input {...field} id="displayName" type="text" aria-invalid={!!fieldState.error} />
              {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
            </Field>
          )}
        />
        <Button type="submit" disabled={ui.state !== "idle"}>
          {ui.state !== "idle" ? (
            <><Spinner data-icon="inline-start" aria-hidden="true" />{getTranslation(ui, "labels", "generateQrCode")}</>
          ) : (
            getTranslation(ui, "labels", "generateQrCode")
          )}
        </Button>
        {form.formState.errors.root && <FieldError>{form.formState.errors.root.message}</FieldError>}
      </form>
    </FormProvider>
  );
}

type MultiFactorEnrollmentVerifyTotpFormProps = {
  secret: TotpSecret;
  displayName: string;
  onSuccess: () => void;
};

export function MultiFactorEnrollmentVerifyTotpForm(props: MultiFactorEnrollmentVerifyTotpFormProps) {
  const ui = useUI();
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
      const assertion = TotpMultiFactorGenerator.assertionForEnrollment(props.secret, values.verificationCode);
      await enrollWithMultiFactorAssertion(ui, assertion, props.displayName);
      props.onSuccess();
    } catch (error) {
      const message = error instanceof FirebaseUIError ? error.message : String(error);
      form.setError("root", { message });
    }
  };

  const qrCodeDataUrl = generateTotpQrCode(ui, props.secret, props.displayName);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-y-4 items-center justify-center">
        <img src={qrCodeDataUrl} alt="TOTP QR Code" className="mx-auto" />
        <code className="text-xs text-muted-foreground text-center">{props.secret.secretKey.toString()}</code>
        <p className="text-xs text-muted-foreground text-center">
          {getTranslation(ui, "prompts", "mfaTotpQrCodePrompt")}
        </p>
      </div>
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-y-4">
          <Controller
            control={form.control}
            name="verificationCode"
            render={({ field, fieldState }) => (
              <Field data-invalid={!!fieldState.error}>
                <FieldLabel htmlFor="verificationCode">{getTranslation(ui, "labels", "verificationCode")}</FieldLabel>
                <InputOTP id="verificationCode" maxLength={6} {...field} aria-invalid={!!fieldState.error}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
                {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
              </Field>
            )}
          />
          <Button type="submit" disabled={ui.state !== "idle"}>
            {ui.state !== "idle" ? (
              <><Spinner data-icon="inline-start" aria-hidden="true" />{getTranslation(ui, "labels", "verifyCode")}</>
            ) : (
              getTranslation(ui, "labels", "verifyCode")
            )}
          </Button>
          {form.formState.errors.root && <FieldError>{form.formState.errors.root.message}</FieldError>}
        </form>
      </FormProvider>
    </div>
  );
}

export type TotpMultiFactorEnrollmentFormProps = {
  onSuccess?: () => void;
};

export function TotpMultiFactorEnrollmentForm(props: TotpMultiFactorEnrollmentFormProps) {
  const ui = useUI();

  const [enrollment, setEnrollment] = useState<{
    secret: TotpSecret;
    displayName: string;
  } | null>(null);

  if (!ui.auth.currentUser) {
    throw new Error("User must be authenticated to enroll with multi-factor authentication");
  }

  if (!enrollment) {
    return (
      <TotpMultiFactorSecretGenerationForm onSubmit={(secret, displayName) => setEnrollment({ secret, displayName })} />
    );
  }

  return (
    <MultiFactorEnrollmentVerifyTotpForm
      {...enrollment}
      onSuccess={() => {
        props.onSuccess?.();
      }}
    />
  );
}
