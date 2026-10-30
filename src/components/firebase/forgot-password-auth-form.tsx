"use client";

import { Spinner } from "@/components/ui/spinner";

import type { ForgotPasswordAuthFormSchema } from "@firebase-oss/ui-core";
import {
  useForgotPasswordAuthFormAction,
  useForgotPasswordAuthFormSchema,
  useUI,
  type ForgotPasswordAuthFormProps,
} from "@firebase-oss/ui-react";
import { useForm, FormProvider, Controller } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { FirebaseUIError, getTranslation } from "@firebase-oss/ui-core";
import { useState } from "react";

import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Policies } from "./policies";

export type { ForgotPasswordAuthFormProps };

export function ForgotPasswordAuthForm(props: ForgotPasswordAuthFormProps) {
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

  async function onSubmit(values: ForgotPasswordAuthFormSchema) {
    try {
      await action(values);
      setEmailSent(true);
      props.onPasswordSent?.();
    } catch (error) {
      const message = error instanceof FirebaseUIError ? error.message : String(error);
      form.setError("root", { message });
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-y-4">
        <Controller
          control={form.control}
          name="email"
          render={({ field, fieldState }) => (
            <Field data-invalid={!!fieldState.error}>
              <FieldLabel htmlFor="email">{getTranslation(ui, "labels", "emailAddress")}</FieldLabel>
              <Input {...field} id="email" type="email" autoComplete="email" aria-invalid={!!fieldState.error} />
              {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
            </Field>
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
        {form.formState.errors.root && <FieldError>{form.formState.errors.root.message}</FieldError>}
        {props.onBackToSignInClick ? (
          <Button type="button" variant="link" size="sm" onClick={props.onBackToSignInClick}>
            <span className="text-xs">&larr; {getTranslation(ui, "labels", "backToSignIn")}</span>
          </Button>
        ) : null}
      </form>
    </FormProvider>
  );
}
