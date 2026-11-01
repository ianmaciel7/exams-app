"use client";

import { Spinner } from "@/components/ui/spinner";

import {
  signInWithEmailAndPassword,
  type SignInAuthFormSchema,
} from "@firebase-oss/ui-core";
import {
  useSignInAuthFormSchema,
  useUI,
  type SignInAuthFormProps,
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

export type { SignInAuthFormProps };

export function SignInAuthForm(props: SignInAuthFormProps) {
  const ui = useUI();
  const schema = useSignInAuthFormSchema();

  const form = useForm<SignInAuthFormSchema>({
    resolver: standardSchemaResolver(schema),
    mode: "onChange",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: SignInAuthFormSchema) {
    try {
      const credential = await signInWithEmailAndPassword(
        ui,
        values.email,
        values.password,
      );
      if (credential) {
        props.onSignIn?.(credential);
      }
    } catch (error) {
      form.setError("root", { message: getAuthErrorMessage(error, ui) });
    }
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
              <Input {...field} type="email" autoComplete="username" />
              <FormFieldError match={!!fieldState.error}>{fieldState.error?.message}</FormFieldError>
            </FormField>
          )}
        />
        <Controller
          control={form.control}
          name="password"
          render={({ field, fieldState }) => (
            <FormField name={field.name} invalid={!!fieldState.error} touched={fieldState.isTouched} dirty={fieldState.isDirty}>
              <FormFieldLabel className="flex items-center gap-2">
                <span className="grow">{getTranslation(ui, "labels", "password")}</span>
                {props.onForgotPasswordClick ? (
                  <Button type="button" variant="link" onClick={props.onForgotPasswordClick} size="sm">
                    <span className="text-xs">{getTranslation(ui, "labels", "forgotPassword")}</span>
                  </Button>
                ) : null}
              </FormFieldLabel>
              <Input {...field} type="password" autoComplete="current-password" />
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
            <><Spinner data-icon="inline-start" aria-hidden="true" />{getTranslation(ui, "labels", "signIn")}</>
          ) : (
            getTranslation(ui, "labels", "signIn")
          )}
        </Button>
        {form.formState.errors.root && <FormError>{form.formState.errors.root.message}</FormError>}
        {props.onSignUpClick ? (
          <>
            <Button type="button" variant="link" size="sm" onClick={props.onSignUpClick}>
              <span className="text-xs">
                {getTranslation(ui, "prompts", "noAccount")} {getTranslation(ui, "labels", "signUp")}
              </span>
            </Button>
          </>
        ) : null}
      </Form>
    </FormProvider>
  );
}
