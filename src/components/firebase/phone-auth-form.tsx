"use client";

import {
  type PhoneAuthFormProps,
  usePhoneAuthNumberFormSchema,
  usePhoneAuthVerifyFormSchema,
  usePhoneNumberFormAction,
  useRecaptchaVerifier,
  useUI,
  useVerifyPhoneNumberFormAction,
} from "@firebase-oss/ui-react";
import { useState } from "react";
import type { UserCredential } from "firebase/auth";
import { useRef } from "react";
import { useForm, FormProvider, Controller } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import {
  formatPhoneNumber,
  getTranslation,
  type PhoneAuthNumberFormSchema,
  type PhoneAuthVerifyFormSchema,
} from "@firebase-oss/ui-core";

import { Field, FieldLabel, FieldDescription, FieldError } from "@/components/ui/field";
import { Form } from "@/components/ui/extensions/form";
import { FormError } from "@/components/ui/extensions/form-error";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Policies } from "@/components/firebase/policies";
import { CountrySelector, type CountrySelectorRef } from "@/components/firebase/country-selector";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { getAuthActionErrorMessage } from "./auth-error-message";

type VerifyPhoneNumberFormProps = {
  verificationId: string;
  onSuccess: (credential: UserCredential) => void;
};

function VerifyPhoneNumberForm(props: VerifyPhoneNumberFormProps) {
  const ui = useUI();
  const schema = usePhoneAuthVerifyFormSchema();
  const action = useVerifyPhoneNumberFormAction();

  const form = useForm<PhoneAuthVerifyFormSchema>({
    resolver: standardSchemaResolver(schema),
    mode: "onChange",
    defaultValues: {
      verificationId: props.verificationId,
      verificationCode: "",
    },
  });

  async function onSubmit(values: PhoneAuthVerifyFormSchema) {
    try {
      const credential = await action(values);
      if (credential) {
        props.onSuccess(credential);
      }
    } catch (error) {
      form.setError("root", { message: getAuthActionErrorMessage(error, ui) });
    }
  }

  return (
    <FormProvider {...form}>
      <Form
        onSubmit={(event) => {
          event.preventDefault();
          void form.handleSubmit(onSubmit)(event);
        }}
        className="flex flex-col gap-4"
      >
        <Controller
          control={form.control}
          name="verificationCode"
          render={({ field, fieldState }) => (
            <Field data-invalid={!!fieldState.error}>
              <FieldLabel htmlFor="verificationCode">{getTranslation(ui, "labels", "verificationCode")}</FieldLabel>
              <FieldDescription>{getTranslation(ui, "prompts", "smsVerificationPrompt")}</FieldDescription>
              <InputOTP id="verificationCode" maxLength={6} {...field} aria-invalid={!!fieldState.error} aria-describedby={fieldState.error ? "verificationCode-error" : undefined}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
              {fieldState.error && <FieldError id="verificationCode-error">{fieldState.error.message}</FieldError>}
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
        {form.formState.errors.root && <FormError>{form.formState.errors.root.message}</FormError>}
      </Form>
    </FormProvider>
  );
}

type PhoneNumberFormProps = {
  onSubmit: (verificationId: string) => void;
};

function PhoneNumberForm(props: PhoneNumberFormProps) {
  const ui = useUI();
  const recaptchaContainerRef = useRef<HTMLDivElement>(null);
  const recaptchaVerifier = useRecaptchaVerifier(recaptchaContainerRef);
  const countrySelector = useRef<CountrySelectorRef>(null);
  const action = usePhoneNumberFormAction();
  const schema = usePhoneAuthNumberFormSchema();

  const form = useForm<PhoneAuthNumberFormSchema>({
    resolver: standardSchemaResolver(schema),
    mode: "onChange",
    defaultValues: {
      phoneNumber: "",
    },
  });

  async function onSubmit(values: PhoneAuthNumberFormSchema) {
    try {
      const formatted = formatPhoneNumber(values.phoneNumber, countrySelector.current!.getCountry());
      const verificationId = await action({ phoneNumber: formatted, recaptchaVerifier: recaptchaVerifier! });
      props.onSubmit(verificationId);
    } catch (error) {
      form.setError("root", { message: getAuthActionErrorMessage(error, ui) });
    }
  }

  return (
    <FormProvider {...form}>
      <Form
        onSubmit={(event) => {
          event.preventDefault();
          void form.handleSubmit(onSubmit)(event);
        }}
        className="flex flex-col gap-4"
      >
        <Controller
          control={form.control}
          name="phoneNumber"
          render={({ field, fieldState }) => (
            <Field data-invalid={!!fieldState.error}>
              <FieldLabel htmlFor="phoneNumber">{getTranslation(ui, "labels", "phoneNumber")}</FieldLabel>
              <div className="flex items-center gap-2">
                <CountrySelector ref={countrySelector} />
                <Input {...field} id="phoneNumber" type="tel" autoComplete="tel-national" aria-invalid={!!fieldState.error} aria-describedby={fieldState.error ? "phoneNumber-error" : undefined} />
              </div>
              {fieldState.error && <FieldError id="phoneNumber-error">{fieldState.error.message}</FieldError>}
            </Field>
          )}
        />
        <div ref={recaptchaContainerRef} />
        <Policies />
        <Button type="submit" disabled={ui.state !== "idle"}>
          {ui.state !== "idle" ? (
            <><Spinner data-icon="inline-start" aria-hidden="true" />{getTranslation(ui, "labels", "sendCode")}</>
          ) : (
            getTranslation(ui, "labels", "sendCode")
          )}
        </Button>
        {form.formState.errors.root && <FormError>{form.formState.errors.root.message}</FormError>}
      </Form>
    </FormProvider>
  );
}

export type { PhoneAuthFormProps };

export function PhoneAuthForm(props: PhoneAuthFormProps) {
  const [verificationId, setVerificationId] = useState<string | null>(null);

  if (!verificationId) {
    return <PhoneNumberForm onSubmit={setVerificationId} />;
  }

  return (
    <VerifyPhoneNumberForm
      verificationId={verificationId}
      onSuccess={(credential) => {
        props.onSignIn?.(credential);
      }}
    />
  );
}
