"use client";

import { getTranslation } from "@firebase-oss/ui-core";
import type { ComponentProps } from "react";
import { Controller, FormProvider } from "react-hook-form";
import { AuthFormInput } from "@/components/notes-app/auth-form-input";
import { CountrySelect } from "@/components/notes-app/country-select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
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
import { Spinner } from "@/components/ui/spinner";
import { useSmsMfaPhoneForm } from "@/hooks/use-sms-mfa-phone-form";
import { cn } from "@/lib/utils";

type SmsMfaPhoneFormProps = Omit<ComponentProps<"form">, "onSubmit"> & {
  onSubmit: (verificationId: string, displayName?: string) => void;
};

function SmsMfaPhoneForm({
  onSubmit,
  className,
  ...props
}: SmsMfaPhoneFormProps) {
  const { countrySelector, form, handleSubmit, recaptchaContainerRef, ui } =
    useSmsMfaPhoneForm({ onSubmit });

  return (
    <FormProvider {...form}>
      <form
        data-slot="sms-mfa-phone-form"
        onSubmit={handleSubmit}
        {...props}
        className={cn("flex flex-col gap-4", className)}
      >
        <FieldGroup>
          <AuthFormInput
            name="displayName"
            label={getTranslation(ui, "labels", "displayName")}
            type="text"
          />
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
          <div
            className="fui-recaptcha-container"
            ref={recaptchaContainerRef}
          />
          <Button type="submit" disabled={ui.state !== "idle"}>
            {ui.state !== "idle" && <Spinner data-icon="inline-start" />}
            {getTranslation(ui, "labels", "sendCode")}
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

export { SmsMfaPhoneForm, type SmsMfaPhoneFormProps };
