"use client";

import { useTranslations } from "next-intl";
import { FormProvider } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/extensions/form";
import { FieldGroup } from "@/components/ui/field";
import { AuthSubmitSection } from "../../_components/auth-submit-section";
import { EmailField } from "../../_components/email-field";
import { PasswordField } from "../../_components/password-field";
import { SocialSignInSection } from "../../_components/social-sign-in-section";
import type { useSignInFormClient } from "../_hooks/use-sign-in-form-client";

type SignInFormController = ReturnType<typeof useSignInFormClient>;

function SignInFormBody({
  rootError,
  form,
  goToForgotPassword,
  goToRegister,
  isPending,
  onSubmit,
}: SignInFormController) {
  const t = useTranslations("Auth");
  return (
    <>
      <FormProvider {...form}>
        <Form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
        >
          <FieldGroup>
            <EmailField autoComplete="username" />
            <PasswordField
              autoComplete="current-password"
              labelAction={
                <Button
                  type="button"
                  variant="link"
                  size="xs"
                  onClick={goToForgotPassword}
                >
                  {t("forgotPasswordPrompt")}
                </Button>
              }
            />
          </FieldGroup>
          <AuthSubmitSection
            error={rootError}
            isPending={isPending}
            submitLabel={t("signInTitle")}
          />
          <div className="text-center text-xs text-muted-foreground">
            {t("noAccountPrompt")}{" "}
            <Button
              type="button"
              variant="link"
              size="xs"
              onClick={goToRegister}
            >
              {t("registerTitle")}
            </Button>
          </div>
        </Form>
      </FormProvider>
      <SocialSignInSection />
    </>
  );
}

export { SignInFormBody };
