"use client";

import { Spinner } from "@/components/ui/spinner";

import {
  createUserWithEmailAndPassword,
  type SignUpAuthFormSchema,
} from "@firebase-oss/ui-core";
import {
  useSignUpAuthFormSchema,
  useUI,
  type SignUpAuthFormProps,
  useRequireDisplayName,
} from "@firebase-oss/ui-react";
import { useForm, FormProvider, Controller } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { getTranslation } from "@firebase-oss/ui-core";

import { Form } from "@/components/ui/extensions/form";
import { FormField, FormFieldLabel, FormFieldError } from "@/components/ui/extensions/form-field";
import { FormError } from "@/components/ui/extensions/form-error";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Policies } from "./policies";
import { getAuthErrorMessage } from "./auth-error-message";

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
      <Form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-y-4">
        {requireDisplayName ? (
          <Controller
            control={form.control}
            name="displayName"
            render={({ field, fieldState }) => (
              <FormField name={field.name} invalid={!!fieldState.error} touched={fieldState.isTouched} dirty={fieldState.isDirty}>
                <FormFieldLabel>{getTranslation(ui, "labels", "displayName")}</FormFieldLabel>
                <Input {...field} autoComplete="name" />
                <FormFieldError match={!!fieldState.error}>{fieldState.error?.message}</FormFieldError>
              </FormField>
            )}
          />
        ) : null}
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
        <Controller
          control={form.control}
          name="password"
          render={({ field, fieldState }) => (
            <FormField name={field.name} invalid={!!fieldState.error} touched={fieldState.isTouched} dirty={fieldState.isDirty}>
              <FormFieldLabel>{getTranslation(ui, "labels", "password")}</FormFieldLabel>
              <Input {...field} type="password" autoComplete="new-password" />
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
            <><Spinner data-icon="inline-start" aria-hidden="true" />{getTranslation(ui, "labels", "createAccount")}</>
          ) : (
            getTranslation(ui, "labels", "createAccount")
          )}
        </Button>
        {form.formState.errors.root && <FormError>{form.formState.errors.root.message}</FormError>}
        {props.onSignInClick ? (
          <Button type="button" variant="link" size="sm" onClick={props.onSignInClick}>
            <span className="text-xs">
              {getTranslation(ui, "prompts", "haveAccount")} {getTranslation(ui, "labels", "signIn")}
            </span>
          </Button>
        ) : null}
      </Form>
    </FormProvider>
  );
}
