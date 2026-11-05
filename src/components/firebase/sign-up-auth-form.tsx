"use client";

import {
  createUserWithEmailAndPassword,
  getTranslation,
  type SignUpAuthFormSchema,
} from "@firebase-oss/ui-core";
import {
  type SignUpAuthFormProps,
  useRequireDisplayName,
  useSignUpAuthFormSchema,
  useUI,
} from "@firebase-oss/ui-react";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { Controller, FormProvider, useForm } from "react-hook-form";
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

export type { SignUpAuthFormProps };

export function SignUpAuthForm(props: SignUpAuthFormProps) {
  const ui = useUI();
  const schema = useSignUpAuthFormSchema();
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

  async function onSubmit(values: SignUpAuthFormSchema) {
    try {
      const credential = await createUserWithEmailAndPassword(
        ui,
        values.email,
        values.password,
        values.displayName,
      );
      if (credential) {
        props.onSignUp?.(credential);
      }
    } catch (error) {
      form.setError("root", { message: getAuthErrorMessage(error, ui) });
    }
  }

  return (
    <FormProvider {...form}>
      <Form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-y-4"
      >
        {requireDisplayName ? (
          <Controller
            control={form.control}
            name="displayName"
            render={({ field, fieldState }) => (
              <FormField
                name={field.name}
                invalid={!!fieldState.error}
                touched={fieldState.isTouched}
                dirty={fieldState.isDirty}
              >
                <FormFieldLabel>
                  {getTranslation(ui, "labels", "displayName")}
                </FormFieldLabel>
                <Input {...field} autoComplete="name" />
                <FormFieldError match={!!fieldState.error}>
                  {fieldState.error?.message}
                </FormFieldError>
              </FormField>
            )}
          />
        ) : null}
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
        <Controller
          control={form.control}
          name="password"
          render={({ field, fieldState }) => (
            <FormField
              name={field.name}
              invalid={!!fieldState.error}
              touched={fieldState.isTouched}
              dirty={fieldState.isDirty}
            >
              <FormFieldLabel>
                {getTranslation(ui, "labels", "password")}
              </FormFieldLabel>
              <Input {...field} type="password" autoComplete="new-password" />
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
              {getTranslation(ui, "labels", "createAccount")}
            </>
          ) : (
            getTranslation(ui, "labels", "createAccount")
          )}
        </Button>
        {form.formState.errors.root && (
          <FormError>{form.formState.errors.root.message}</FormError>
        )}
        {props.onSignInClick ? (
          <Button
            type="button"
            variant="link"
            size="sm"
            onClick={props.onSignInClick}
          >
            <span className="text-xs">
              {getTranslation(ui, "prompts", "haveAccount")}{" "}
              {getTranslation(ui, "labels", "signIn")}
            </span>
          </Button>
        ) : null}
      </Form>
    </FormProvider>
  );
}
