"use client";

import {
  type ForgotPasswordAuthFormSchema,
  getTranslation,
  sendPasswordResetEmail,
} from "@firebase-oss/ui-core";
import {
  type ForgotPasswordAuthFormProps,
  useForgotPasswordAuthFormSchema,
  useUI,
} from "@firebase-oss/ui-react";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useId, useState } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/extensions/form";
import { FormError } from "@/components/ui/extensions/form-error";
import {
  FormField,
  FormFieldError,
  FormFieldLabel,
} from "@/components/ui/extensions/form-field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { getAuthErrorMessage } from "./auth-error-message";
import { Policies } from "./policies";

export type { ForgotPasswordAuthFormProps };

export function ForgotPasswordAuthForm(props: ForgotPasswordAuthFormProps) {
  const ui = useUI();
  const schema = useForgotPasswordAuthFormSchema();
  const [emailSent, setEmailSent] = useState(false);

  const form = useForm<ForgotPasswordAuthFormSchema>({
    resolver: standardSchemaResolver(schema),
    mode: "onChange",
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(values: ForgotPasswordAuthFormSchema) {
    try {
      await sendPasswordResetEmail(ui, values.email);
      setEmailSent(true);
      props.onPasswordSent?.();
    } catch (error) {
      form.setError("root", { message: getAuthErrorMessage(error, ui) });
    }
  }

  if (emailSent) {
    return (
      <Alert role="status">
        <AlertDescription>
          {getTranslation(ui, "messages", "checkEmailForReset")}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <FormProvider {...form}>
      <Form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-y-4"
      >
        <Controller
          control={form.control}
          name="email"
          render={({ field, fieldState }) => (
            <FormField
              name={field.name}
              invalid={!!fieldState.error}
              touched={fieldState.isTouched}
              dirty={fieldState.isDirty}
            >
              <FormFieldLabel>
                {getTranslation(ui, "labels", "emailAddress")}
              </FormFieldLabel>
              <Input {...field} type="email" autoComplete="email" />
              <FormFieldError match={!!fieldState.error}>
                {fieldState.error?.message}
              </FormFieldError>
            </FormField>
          )}
        />
        <Policies />
        <Button
          type="submit"
          disabled={ui.state !== "idle"}
          focusableWhenDisabled
        >
          {ui.state !== "idle" ? (
            <>
              <Spinner data-icon="inline-start" aria-hidden="true" />
              {getTranslation(ui, "labels", "resetPassword")}
            </>
          ) : (
            getTranslation(ui, "labels", "resetPassword")
          )}
        </Button>
        {form.formState.errors.root && (
          <FormError>{form.formState.errors.root.message}</FormError>
        )}
        {props.onBackToSignInClick ? (
          <Button
            type="button"
            variant="link"
            size="sm"
            onClick={props.onBackToSignInClick}
          >
            <span className="text-xs">
              &larr; {getTranslation(ui, "labels", "backToSignIn")}
            </span>
          </Button>
        ) : null}
      </Form>
    </FormProvider>
  );
}
