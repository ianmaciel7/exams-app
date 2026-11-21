"use client";

import type { SignInAuthFormSchema } from "@firebase-oss/ui-core";
import { FirebaseUIError, getTranslation } from "@firebase-oss/ui-core";
import {
  type SignInAuthFormProps as FirebaseSignInAuthFormProps,
  useSignInAuthFormAction,
  useSignInAuthFormSchema,
  useUI,
} from "@firebase-oss/ui-react";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import type { ComponentProps } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { AuthFormInput } from "@/components/notes-app/auth-form-input";
import { AuthPoliciesDescription } from "@/components/notes-app/auth-policies-description";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

type LoginFormProps = Omit<ComponentProps<"form">, "onSubmit"> &
  FirebaseSignInAuthFormProps;

function LoginForm({
  onSignIn,
  onForgotPasswordClick,
  onSignUpClick,
  className,
  ...props
}: LoginFormProps) {
  const ui = useUI();
  const schema = useSignInAuthFormSchema();
  const action = useSignInAuthFormAction();

  const form = useForm<SignInAuthFormSchema>({
    resolver: standardSchemaResolver(schema),
    mode: "onChange",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: SignInAuthFormSchema) => {
    try {
      const credential = await action(values);
      if (credential) {
        onSignIn?.(credential);
      }
    } catch (error) {
      const message =
        error instanceof FirebaseUIError ? error.message : String(error);
      form.setError("root", { message });
    }
  };

  return (
    <FormProvider {...form}>
      <form
        data-slot="login-form"
        className={cn(className)}
        onSubmit={(event) => {
          event.preventDefault();
          void form.handleSubmit(onSubmit)(event);
        }}
        {...props}
      >
        <FieldGroup>
          <AuthFormInput<SignInAuthFormSchema>
            name="email"
            type="email"
            label={getTranslation(ui, "labels", "emailAddress")}
          />
          <AuthFormInput<SignInAuthFormSchema>
            name="password"
            type="password"
            label={getTranslation(ui, "labels", "password")}
            labelAction={
              onForgotPasswordClick ? (
                <Button
                  type="button"
                  variant="link"
                  size="xs"
                  onClick={onForgotPasswordClick}
                >
                  {getTranslation(ui, "labels", "forgotPassword")}
                </Button>
              ) : null
            }
          />
          {form.formState.errors.root && (
            <Alert variant="destructive">
              <AlertDescription>
                {form.formState.errors.root.message}
              </AlertDescription>
            </Alert>
          )}
          <Field>
            <Button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="w-full"
            >
              {form.formState.isSubmitting && (
                <Spinner data-icon="inline-start" />
              )}
              {getTranslation(ui, "labels", "signIn")}
            </Button>
          </Field>
          <AuthPoliciesDescription />
          {onSignUpClick ? (
            <Field>
              <Button
                data-testid="login-form-mode-toggle"
                type="button"
                variant="link"
                size="sm"
                onClick={onSignUpClick}
              >
                {getTranslation(ui, "prompts", "noAccount")}{" "}
                {getTranslation(ui, "labels", "signUp")}
              </Button>
            </Field>
          ) : null}
        </FieldGroup>
      </form>
    </FormProvider>
  );
}

export { LoginForm, type LoginFormProps };
