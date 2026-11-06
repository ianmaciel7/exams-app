"use client";
import type { ComponentProps } from "react";
import { FormProvider } from "react-hook-form";
import { useForgotPasswordFormClient } from "../_hooks/use-forgot-password-form-client";
import {
  ForgotPasswordForm,
  ForgotPasswordFormContent,
} from "./forgot-password-form";

type ForgotPasswordFormClientProps = ComponentProps<
  typeof ForgotPasswordForm
> & { next?: string | string[] };
function ForgotPasswordFormClient({
  next,
  ...props
}: ForgotPasswordFormClientProps) {
  const { rootError, emailSent, form, isPending, onSubmit } =
    useForgotPasswordFormClient();
  return (
    <ForgotPasswordForm {...props}>
      {
        <FormProvider {...form}>
          <ForgotPasswordFormContent
            next={next}
            rootError={rootError}
            isPending={isPending}
            onSubmit={form.handleSubmit(onSubmit)}
            emailSent={emailSent}
          />
        </FormProvider>
      }
    </ForgotPasswordForm>
  );
}

export { ForgotPasswordFormClient };
