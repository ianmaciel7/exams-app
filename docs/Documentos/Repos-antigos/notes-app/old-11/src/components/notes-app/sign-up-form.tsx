"use client";

import type { SignUpAuthFormSchema } from "@firebase-oss/ui-core";
import { FirebaseUIError, getTranslation } from "@firebase-oss/ui-core";
import {
  type SignUpAuthFormProps as FirebaseSignUpAuthFormProps,
  useRequireDisplayName,
  useSignUpAuthFormAction,
  useSignUpAuthFormSchema,
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

type SignUpFormProps = Omit<ComponentProps<"form">, "onSubmit"> &
  FirebaseSignUpAuthFormProps;

function SignUpForm({
  onSignUp,
  onSignInClick,
  className,
  ...props
}: SignUpFormProps) {
  const ui = useUI();
  const schema = useSignUpAuthFormSchema();
  const action = useSignUpAuthFormAction();
  const requireDisplayName = useRequireDisplayName();

  const form = useForm<SignUpAuthFormSchema>({
    resolver: standardSchemaResolver(schema),
    mode: "onChange",
    defaultValues: {
      email: "",
      password: "",
      displayName: requireDisplayName ? "" : undefined,
    },
  });

  const onSubmit = async (values: SignUpAuthFormSchema) => {
    try {
      const credential = await action(values);
      if (credential) {
        onSignUp?.(credential);
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
        data-slot="sign-up-form"
        onSubmit={(event) => {
          event.preventDefault();
          void form.handleSubmit(onSubmit)(event);
        }}
        className={cn(className)}
        {...props}
      >
        <FieldGroup>
          {requireDisplayName ? (
            <AuthFormInput
              name="displayName"
              label={getTranslation(ui, "labels", "displayName")}
            />
          ) : null}
          <AuthFormInput
            name="email"
            type="email"
            label={getTranslation(ui, "labels", "emailAddress")}
          />
          <AuthFormInput
            name="password"
            type="password"
            label={getTranslation(ui, "labels", "password")}
          />
          <AuthPoliciesDescription />
          <Field>
            <Button
              type="submit"
              disabled={ui.state !== "idle"}
              className="w-full"
            >
              {ui.state !== "idle" && <Spinner data-icon="inline-start" />}
              {getTranslation(ui, "labels", "createAccount")}
            </Button>
          </Field>
          {form.formState.errors.root && (
            <Alert variant="destructive">
              <AlertDescription>
                {form.formState.errors.root.message}
              </AlertDescription>
            </Alert>
          )}
          {onSignInClick ? (
            <Field>
              <Button
                data-testid="sign-up-form-mode-toggle"
                type="button"
                variant="link"
                size="sm"
                onClick={onSignInClick}
              >
                {getTranslation(ui, "prompts", "haveAccount")}{" "}
                {getTranslation(ui, "labels", "signIn")}
              </Button>
            </Field>
          ) : null}
        </FieldGroup>
      </form>
    </FormProvider>
  );
}

export { SignUpForm, type SignUpFormProps };
