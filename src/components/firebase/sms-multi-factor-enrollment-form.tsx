"use client";

import { useRef, useState } from "react";
import { multiFactor, PhoneAuthProvider, PhoneMultiFactorGenerator } from "firebase/auth";
import {
  enrollWithMultiFactorAssertion,
  FirebaseUIError,
  formatPhoneNumber,
  getTranslation,
  verifyPhoneNumber,
} from "@firebase-oss/ui-core";
import { CountrySelector, type CountrySelectorRef } from "@/components/firebase/country-selector";
import {
  useMultiFactorPhoneAuthNumberFormSchema,
  useMultiFactorPhoneAuthVerifyFormSchema,
  useRecaptchaVerifier,
  useUI,
} from "@firebase-oss/ui-react";
import { useForm, FormProvider, Controller } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";

import { Field, FieldLabel, FieldDescription, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

type MultiFactorEnrollmentPhoneNumberFormProps = {
  onSubmit: (verificationId: string, displayName?: string) => void;
};

function MultiFactorEnrollmentPhoneNumberForm(props: MultiFactorEnrollmentPhoneNumberFormProps) {
  const ui = useUI();
  const recaptchaContainerRef = useRef<HTMLDivElement>(null);
  const recaptchaVerifier = useRecaptchaVerifier(recaptchaContainerRef);
  const countrySelector = useRef<CountrySelectorRef>(null);
  const schema = useMultiFactorPhoneAuthNumberFormSchema();

  const form = useForm<{ displayName: string; phoneNumber: string }>({
    resolver: standardSchemaResolver(schema),
    mode: "onChange",
    defaultValues: {
      displayName: "",
      phoneNumber: "",
    },
  });

  const onSubmit = async (values: { displayName: string; phoneNumber: string }) => {
    try {
      const formatted = formatPhoneNumber(values.phoneNumber, countrySelector.current!.getCountry());
      const mfaUser = multiFactor(ui.auth.currentUser!);
      const confirmationResult = await verifyPhoneNumber(ui, formatted, recaptchaVerifier!, mfaUser);
      props.onSubmit(confirmationResult, values.displayName);
    } catch (error) {
      const message = error instanceof FirebaseUIError ? error.message : String(error);
      form.setError("root", { message });
    }
  };

  return (
    <FormProvider {...form}>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void form.handleSubmit(onSubmit)(event);
        }}
        className="flex flex-col gap-y-4"
      >
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
        <Controller
          control={form.control}
          name="phoneNumber"
          render={({ field, fieldState }) => (
            <Field data-invalid={!!fieldState.error}>
              <FieldLabel htmlFor="phoneNumber">{getTranslation(ui, "labels", "phoneNumber")}</FieldLabel>
              <div className="flex items-center gap-2">
                <CountrySelector ref={countrySelector} />
                <Input {...field} id="phoneNumber" type="tel" className="flex-grow" aria-invalid={!!fieldState.error} />
              </div>
              {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
            </Field>
          )}
        />
        <div className="fui-recaptcha-container" ref={recaptchaContainerRef} />
        <Button type="submit" disabled={ui.state !== "idle"}>
          {ui.state !== "idle" ? (
            <><Spinner data-icon="inline-start" aria-hidden="true" />{getTranslation(ui, "labels", "sendCode")}</>
          ) : (
            getTranslation(ui, "labels", "sendCode")
          )}
        </Button>
        {form.formState.errors.root && <FieldError>{form.formState.errors.root.message}</FieldError>}
      </form>
    </FormProvider>
  );
}

type MultiFactorEnrollmentVerifyPhoneNumberFormProps = {
  verificationId: string;
  displayName?: string;
  onSuccess: () => void;
};

export function MultiFactorEnrollmentVerifyPhoneNumberForm(props: MultiFactorEnrollmentVerifyPhoneNumberFormProps) {
  const ui = useUI();
  const schema = useMultiFactorPhoneAuthVerifyFormSchema();

  const form = useForm<{ verificationId: string; verificationCode: string }>({
    resolver: standardSchemaResolver(schema),
    mode: "onChange",
    defaultValues: {
      verificationId: props.verificationId,
      verificationCode: "",
    },
  });

  const onSubmit = async (values: { verificationId: string; verificationCode: string }) => {
    try {
      const credential = PhoneAuthProvider.credential(values.verificationId, values.verificationCode);
      const assertion = PhoneMultiFactorGenerator.assertion(credential);
      await enrollWithMultiFactorAssertion(ui, assertion, props.displayName);
      props.onSuccess();
    } catch (error) {
      const message = error instanceof FirebaseUIError ? error.message : String(error);
      form.setError("root", { message });
    }
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <Controller
          control={form.control}
          name="verificationCode"
          render={({ field, fieldState }) => (
            <Field data-invalid={!!fieldState.error}>
              <FieldLabel htmlFor="verificationCode">{getTranslation(ui, "labels", "verificationCode")}</FieldLabel>
              <FieldDescription>{getTranslation(ui, "prompts", "smsVerificationPrompt")}</FieldDescription>
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
  );
}

export type SmsMultiFactorEnrollmentFormProps = {
  onSuccess?: () => void;
};

export function SmsMultiFactorEnrollmentForm(props: SmsMultiFactorEnrollmentFormProps) {
  const ui = useUI();

  const [verification, setVerification] = useState<{
    verificationId: string;
    displayName?: string;
  } | null>(null);

  if (!ui.auth.currentUser) {
    throw new Error("User must be authenticated to enroll with multi-factor authentication");
  }

  if (!verification) {
    return (
      <MultiFactorEnrollmentPhoneNumberForm
        onSubmit={(verificationId, displayName) => setVerification({ verificationId, displayName })}
      />
    );
  }

  return (
    <MultiFactorEnrollmentVerifyPhoneNumberForm
      {...verification}
      onSuccess={() => {
        props.onSuccess?.();
      }}
    />
  );
}
