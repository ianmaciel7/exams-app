"use client";

import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import type { EmailLinkAuthFormSchema } from "@firebase-oss/ui-core";
import {
  getTranslation,
  sendSignInLinkToEmail,
} from "@firebase-oss/ui-core";
import {
  useEmailLinkAuthFormCompleteSignIn,
  useEmailLinkAuthFormSchema,
  useUI,
  type EmailLinkAuthFormProps,
} from "@firebase-oss/ui-react";
import { useId, useState } from "react";
import { useForm, FormProvider, Controller } from "react-hook-form";

import { Policies } from "@/components/firebase/policies";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Form } from "@/components/ui/extensions/form";
import { FormField, FormFieldLabel, FormFieldError } from "@/components/ui/extensions/form-field";
import { FormError } from "@/components/ui/extensions/form-error";
import { Input } from "@/components/ui/input";
import { getAuthErrorMessage } from "./auth-error-message";

export type { EmailLinkAuthFormProps };

export function EmailLinkAuthForm(props: EmailLinkAuthFormProps) {
  const { onEmailSent, onSignIn } = props;
  const ui = useUI();
  const schema = useEmailLinkAuthFormSchema();
  const [emailSent, setEmailSent] = useState(false);

  const form = useForm<EmailLinkAuthFormSchema>({
    resolver: standardSchemaResolver(schema),
    mode: "onChange",
    defaultValues: {
      email: "",
    },
  });

  useEmailLinkAuthFormCompleteSignIn(onSignIn);

  async function onSubmit(values: EmailLinkAuthFormSchema) {
    try {
      await sendSignInLinkToEmail(ui, values.email);
      setEmailSent(true);
      onEmailSent?.();
    } catch (error) {
      form.setError("root", { message: getAuthErrorMessage(error, ui) });
    }
  }

  if (emailSent) {
    return (
      <Alert>
        <AlertDescription>{getTranslation(ui, "messages", "signInLinkSent")}</AlertDescription>
      </Alert>
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
        <Button type="submit" disabled={ui.state !== "idle"}>
          {ui.state !== "idle" ? (
            <><Spinner data-icon="inline-start" aria-hidden="true" />{getTranslation(ui, "labels", "sendSignInLink")}</>
          ) : (
            getTranslation(ui, "labels", "sendSignInLink")
          )}
        </Button>
        {form.formState.errors.root && <FormError>{form.formState.errors.root.message}</FormError>}
      </Form>
    </FormProvider>
  );
}
