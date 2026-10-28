"use client";

import { Spinner } from "@/components/ui/spinner";

import {
  sendPasswordResetEmail,
  type ForgotPasswordAuthFormSchema,
} from "@firebase-oss/ui-core";
import {
  useForgotPasswordAuthFormSchema,
  useUI,
  type ForgotPasswordAuthFormProps,
} from "@firebase-oss/ui-react";
import { useForm, FormProvider, Controller } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { getTranslation } from "@firebase-oss/ui-core";
import { useId, useState } from "react";

import { Form } from "@/components/ui/extensions/form";
import { FormField, FormFieldLabel, FormFieldError } from "@/components/ui/extensions/form-field";
import { FormError } from "@/components/ui/extensions/form-error";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Policies } from "./policies";
import { getAuthErrorMessage } from "./auth-error-message";

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
      <div className="text-center space-y-4">
        <div className="text-green-600 dark:text-green-400">{getTranslation(ui, "messages", "checkEmailForReset")}</div>
      </div>
    );
  }

  return (
    <FormProvider {...form}>
      <Form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-y-4">
        <Controller
          control={form.control}
          name="email"
          render={({ field, fieldState }) => (
            <FormField name={field.name} invalid={!!fieldState.error} touched={fieldState.isTouched} dirty={fieldState.isDirty}>
              <FormFieldLabel>{getTranslation(ui, "labels", "emailAddress")}</FormFieldLabel>
              <Input {...field} type="email" autoComplete="email" />
              <FormFieldError match={!!fieldState.error}>{fieldState.error?.message}</FormFieldError>
            </FormField>
          )}
        />
        <Policies />
        <Button
          type="submit"
          disabled={ui.state !== "idle"}
        >
          {ui.state !== "idle" ? (
            <><Spinner data-icon="inline-start" aria-hidden="true" />{getTranslation(ui, "labels", "resetPassword")}</>
          ) : (
            getTranslation(ui, "labels", "resetPassword")
          )}
        </Button>
        {form.formState.errors.root && <FormError>{form.formState.errors.root.message}</FormError>}
        {props.onBackToSignInClick ? (
          <Button type="button" variant="link" size="sm" onClick={props.onBackToSignInClick}>
            <span className="text-xs">&larr; {getTranslation(ui, "labels", "backToSignIn")}</span>
          </Button>
        ) : null}
      </Form>
    </FormProvider>
  );
}
