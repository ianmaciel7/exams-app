"use client";

import {
  FirebaseUIError,
  formatPhoneNumber,
  getTranslation,
  type PhoneAuthNumberFormSchema,
} from "@firebase-oss/ui-core";
import {
  usePhoneAuthNumberFormSchema,
  usePhoneNumberFormAction,
  useRecaptchaVerifier,
  useUI,
} from "@firebase-oss/ui-react";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import type { ComponentProps } from "react";
import { useRef } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { AuthFormErrorAlert } from "@/components/notes-app/auth-form-error-alert";
import { AuthPoliciesDescription } from "@/components/notes-app/auth-policies-description";
import { AuthSubmitButton } from "@/components/notes-app/auth-submit-button";
import {
  CountrySelect,
  type CountrySelectorRef,
} from "@/components/notes-app/country-select";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { cn } from "@/lib/utils";

type PhoneNumberFormProps = Omit<ComponentProps<"form">, "onSubmit"> & {
  onSubmit: (verificationId: string) => void;
};

function PhoneNumberForm({
  onSubmit: onVerificationSuccess,
  className,
  ...props
}: PhoneNumberFormProps) {
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

  const onSubmit = async (values: PhoneAuthNumberFormSchema) => {
    try {
      const countrySelectorInstance = countrySelector.current;
      const verifier = recaptchaVerifier;
      if (!countrySelectorInstance || !verifier) {
        form.setError("root", {
          message: getTranslation(ui, "errors", "unknownError"),
        });
        return;
      }
      const formatted = formatPhoneNumber(
        values.phoneNumber,
        countrySelectorInstance.getCountry()
      );
      const verificationId = await action({
        phoneNumber: formatted,
        recaptchaVerifier: verifier,
      });
      onVerificationSuccess(verificationId);
    } catch (error) {
      const message =
        error instanceof FirebaseUIError ? error.message : String(error);
      form.setError("root", { message });
    }
  };

  return (
    <FormProvider {...form}>
      <form
        data-slot="phone-number-form"
        onSubmit={(event) => {
          event.preventDefault();
          void form.handleSubmit(onSubmit)(event);
        }}
        className={cn("flex flex-col gap-4", className)}
        {...props}
      >
        <FieldGroup>
          <Controller
            control={form.control}
            name="phoneNumber"
            render={({ field, fieldState }) => (
              <Field data-invalid={!!fieldState.error}>
                <FieldLabel htmlFor="phoneNumber">
                  {getTranslation(ui, "labels", "phoneNumber")}
                </FieldLabel>
                <InputGroup>
                  <InputGroupAddon>
                    <CountrySelect ref={countrySelector} />
                  </InputGroupAddon>
                  <InputGroupInput
                    {...field}
                    id="phoneNumber"
                    type="tel"
                    aria-invalid={!!fieldState.error}
                  />
                </InputGroup>
                {fieldState.error && (
                  <FieldError>{fieldState.error.message}</FieldError>
                )}
              </Field>
            )}
          />
          <div ref={recaptchaContainerRef} />
          <AuthPoliciesDescription />
          <AuthSubmitButton type="submit" busy={ui.state !== "idle"}>
            {getTranslation(ui, "labels", "sendCode")}
          </AuthSubmitButton>
          <AuthFormErrorAlert message={form.formState.errors.root?.message} />
        </FieldGroup>
      </form>
    </FormProvider>
  );
}

export { PhoneNumberForm, type PhoneNumberFormProps };
