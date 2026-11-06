"use client";

import { useTranslations } from "next-intl";
import { FormProvider } from "react-hook-form";
import { Form } from "@/components/ui/extensions/form";
import { FieldGroup } from "@/components/ui/field";
import { routes } from "@/lib/navigation";
import { AuthLink } from "../../_components/auth-link";
import { AuthSubmitSection } from "../../_components/auth-submit-section";
import { EmailField } from "../../_components/email-field";
import { PasswordField } from "../../_components/password-field";
import { SocialSignInSection } from "../../_components/social-sign-in-section";
import type { useSignInFormClient } from "../_hooks/use-sign-in-form-client";

type SignInFormController = ReturnType<typeof useSignInFormClient> & {
  next?: string | string[];
};

function SignInFormBody({
  rootError,
  form,
  next,
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
                <AuthLink route={routes.forgotPassword} next={next}>
                  {t("forgotPasswordPrompt")}
                </AuthLink>
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
            <AuthLink route={routes.register} next={next}>
              {t("registerTitle")}
            </AuthLink>
          </div>
        </Form>
      </FormProvider>
      <SocialSignInSection />
    </>
  );
}

export { SignInFormBody };
