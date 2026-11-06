"use client";

import { useTranslations } from "next-intl";
import type { ComponentProps } from "react";
import { FormProvider } from "react-hook-form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/extensions/form";
import { FieldGroup } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import { AuthSubmitSection } from "../../_components/auth-submit-section";
import { EmailField } from "../../_components/email-field";
import { useForgotPasswordFormClient } from "../_hooks/use-forgot-password-form-client";

type ForgotPasswordFormClientProps = ComponentProps<"div">;

function ForgotPasswordFormClient({
  className,
  ...props
}: ForgotPasswordFormClientProps) {
  const t = useTranslations("Auth");
  const { emailSent, form, goToSignIn, isPending, onSubmit } =
    useForgotPasswordFormClient();

  return (
    <div
      data-slot="forgot-password-form"
      className={cn("flex flex-col gap-4", className)}
      {...props}
    >
      {emailSent ? (
        <Alert role="status">
          <AlertDescription>{t("resetEmailSent")}</AlertDescription>
        </Alert>
      ) : (
        <FormProvider {...form}>
          <Form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <FieldGroup>
              <EmailField autoComplete="email" />
            </FieldGroup>
            <AuthSubmitSection
              error={form.formState.errors.root?.message}
              isPending={isPending}
              submitLabel={t("forgotPasswordTitle")}
            />
          </Form>
        </FormProvider>
      )}
      <Button type="button" variant="link" size="xs" onClick={goToSignIn}>
        {t("backToSignIn")}
      </Button>
    </div>
  );
}

export { ForgotPasswordFormClient };
