"use client";

import type { ForgotPasswordAuthFormSchema } from "@firebase-oss/ui-core";
import { FirebaseUIError, getTranslation } from "@firebase-oss/ui-core";
import {
  type ForgotPasswordAuthFormProps as FirebaseForgotPasswordAuthFormProps,
  useForgotPasswordAuthFormAction,
  useForgotPasswordAuthFormSchema,
  useUI,
} from "@firebase-oss/ui-react";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { ArrowLeft } from "lucide-react";
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

type ForgotPasswordFormProps = Omit<ComponentProps<"form">, "onSubmit"> &
  FirebaseForgotPasswordAuthFormProps;

function ForgotPasswordForm({
  onPasswordSent,
  onBackToSignInClick,
  className,
  ...props
}: ForgotPasswordFormProps) {
  const ui = useUI();
  const schema = useForgotPasswordAuthFormSchema();
  const action = useForgotPasswordAuthFormAction();
  const [emailSent, setEmailSent] = useState(false);

  const form = useForm<ForgotPasswordAuthFormSchema>({
    resolver: standardSchemaResolver(schema),
    mode: "onChange",
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (values: ForgotPasswordAuthFormSchema) => {
    try {
      await action(values);
      setEmailSent(true);
      onPasswordSent?.();
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
          {getTranslation(ui, "messages", "checkEmailForReset")}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <FormProvider {...form}>
      <form
        data-slot="forgot-password-form"
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
              {getTranslation(ui, "labels", "resetPassword")}
            </Button>
          </Field>
          {form.formState.errors.root && (
            <Alert variant="destructive">
              <AlertDescription>
                {form.formState.errors.root.message}
              </AlertDescription>
            </Alert>
          )}
          {onBackToSignInClick ? (
            <Field>
              <Button
                type="button"
                variant="link"
                size="sm"
                onClick={onBackToSignInClick}
              >
                <ArrowLeft data-icon="inline-start" aria-hidden="true" />
                {getTranslation(ui, "labels", "backToSignIn")}
              </Button>
            </Field>
          ) : null}
        </FieldGroup>
      </form>
    </FormProvider>
  );
}

export { ForgotPasswordForm, type ForgotPasswordFormProps };
