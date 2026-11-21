"use client";

import type { EmailLinkAuthFormSchema } from "@firebase-oss/ui-core";
import { FirebaseUIError, getTranslation } from "@firebase-oss/ui-core";
import {
  type EmailLinkAuthFormProps as FirebaseEmailLinkAuthFormProps,
  useEmailLinkAuthFormAction,
  useEmailLinkAuthFormCompleteSignIn,
  useEmailLinkAuthFormSchema,
  useUI,
} from "@firebase-oss/ui-react";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import type { ComponentProps } from "react";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";

import { AuthFormInput } from "@/components/notes-app/auth-form-input";
import { AuthPoliciesDescription } from "@/components/notes-app/auth-policies-description";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

type EmailLinkFormProps = Omit<ComponentProps<"form">, "onSubmit"> &
  FirebaseEmailLinkAuthFormProps;

function EmailLinkForm({
  onEmailSent,
  onSignIn,
  className,
  ...props
}: EmailLinkFormProps) {
  const ui = useUI();
  const schema = useEmailLinkAuthFormSchema();
  const action = useEmailLinkAuthFormAction();
  const [emailSent, setEmailSent] = useState(false);

  const form = useForm<EmailLinkAuthFormSchema>({
    resolver: standardSchemaResolver(schema),
    mode: "onChange",
    defaultValues: {
      email: "",
    },
  });

  useEmailLinkAuthFormCompleteSignIn(onSignIn);

  const onSubmit = async (values: EmailLinkAuthFormSchema) => {
    try {
      await action(values);
      setEmailSent(true);
      onEmailSent?.();
    } catch (error) {
      const message =
        error instanceof FirebaseUIError ? error.message : String(error);
      form.setError("root", { message });
    }
  };

  if (emailSent) {
    return (
      <Alert>
        <AlertDescription>
          {getTranslation(ui, "messages", "signInLinkSent")}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <FormProvider {...form}>
      <form
        data-slot="email-link-form"
        onSubmit={(event) => {
          event.preventDefault();
          void form.handleSubmit(onSubmit)(event);
        }}
        className={cn(className)}
        {...props}
      >
        <FieldGroup>
          <AuthFormInput
            name="email"
            type="email"
            label={getTranslation(ui, "labels", "emailAddress")}
          />
          <AuthPoliciesDescription />
          <Field>
            <Button type="submit" disabled={ui.state !== "idle"}>
              {ui.state !== "idle" && <Spinner data-icon="inline-start" />}
              {getTranslation(ui, "labels", "sendSignInLink")}
            </Button>
          </Field>
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

export { EmailLinkForm, type EmailLinkFormProps };
